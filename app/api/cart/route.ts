import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/middleware"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

// GET /api/cart - Get user's cart
export async function GET() {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const user = await verifyAuth(new NextRequest("http://localhost"))
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            produce: {
              include: {
                producer: {
                  select: {
                    name: true,
                    farmName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              produce: {
                include: {
                  producer: {
                    select: {
                      name: true,
                      farmName: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    }

    // Transform cart items to match frontend expectations
    const cartItems = cart.items.map((item: any) => ({
      id: item.produce.id,
      name: item.produce.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.produce.unit,
      producer: item.produce.producer.farmName || item.produce.producer.name,
      maxQuantity: item.produce.quantity,
      description: item.produce.description,
      category: item.produce.category,
      farmingMethod: item.produce.farmingMethod,
      location: item.produce.location,
    }))

    return NextResponse.json({ cart: cartItems })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const user = await verifyAuth(request)
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { produceId, quantity = 1 } = await request.json()

    if (!produceId) {
      return NextResponse.json({ error: "Produce ID is required" }, { status: 400 })
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      })
    }

    // Get produce details
    const produce = await prisma.produce.findUnique({
      where: { id: produceId },
      include: {
        producer: {
          select: {
            name: true,
            farmName: true,
          },
        },
      },
    })

    if (!produce) {
      return NextResponse.json({ error: "Produce not found" }, { status: 404 })
    }

    if (produce.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        produceId: produceId,
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = Math.min(existingItem.quantity + quantity, produce.quantity)
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          produceId: produceId,
          quantity: quantity,
          price: produce.price,
        },
      })
    }

    return NextResponse.json({ message: "Item added to cart" })
  } catch (error) {
    console.error("Error adding item to cart:", error)
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const user = await verifyAuth(request)
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { produceId, quantity } = await request.json()

    if (!produceId || quantity === undefined) {
      return NextResponse.json({ error: "Produce ID and quantity are required" }, { status: 400 })
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        produceId: produceId,
      },
      include: {
        produce: true,
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    if (quantity <= 0) {
      // Remove item from cart
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      })
    } else {
      // Update quantity
      const newQuantity = Math.min(quantity, cartItem.produce.quantity)
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: newQuantity },
      })
    }

    return NextResponse.json({ message: "Cart updated" })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const user = await verifyAuth(request)
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { produceId } = await request.json()

    if (!produceId) {
      return NextResponse.json({ error: "Produce ID is required" }, { status: 400 })
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Remove item from cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        produceId: produceId,
      },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing item from cart:", error)
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 })
  }
} 