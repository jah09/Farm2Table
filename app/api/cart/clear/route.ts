import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/middleware"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

// POST /api/cart/clear - Clear user's cart
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

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Remove all items from cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    })

    return NextResponse.json({ message: "Cart cleared" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
} 