import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/middleware"
import { createEnhancedProduceWithEmbedding } from "@/lib/embeddings"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

export async function GET() {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const produces = await prisma.produce.findMany({
      where: {
        isActive: true,
        quantity: {
          gt: 0,
        },
      },
      include: {
        producer: {
          select: {
            name: true,
            location: true,
            farmingMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedProduces = produces.map((produce) => ({
      id: produce.id,
      name: produce.name,
      description: produce.description,
      price: produce.price,
      quantity: produce.quantity,
      unit: produce.unit,
      category: produce.category,
      subCategory: produce.subCategory,
      season: produce.season,
      farmingMethod: produce.farmingMethod || produce.producer.farmingMethod,
      location: produce.location || produce.producer.location,
      nutritionalHighlights: produce.nutritionalHighlights || [],
      commonUses: produce.commonUses || [],
      preparationTips: produce.preparationTips,
      storageInstructions: produce.storageInstructions,
      shelfLife: produce.shelfLife,
      imageUrl: produce.imageUrl,
      producer: produce.producer.name,
      producerLocation: produce.producer.location,
      aiGenerated: produce.aiGeneratedDescription,
      dateAdded: produce.createdAt.toISOString().split("T")[0],
    }))

    return NextResponse.json(formattedProduces)
  } catch (error) {
    console.error("Error fetching produce:", error)
    return NextResponse.json({ error: "Failed to fetch produce" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== "PRODUCER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, price, quantity, category } = await request.json()

    if (!name || !price || !quantity) {
      return NextResponse.json({ error: "Name, price, and quantity are required" }, { status: 400 })
    }

    // Create produce with AI-generated description and embedding
    const produce = await createEnhancedProduceWithEmbedding(
      {
        name,
        price: Number.parseFloat(price),
        quantity: Number.parseInt(quantity),
        category,
        producerId: user.id,
      },
      {
        name: user.name,
        location: undefined,
        farmingMethod: undefined,
      }
    )

    return NextResponse.json({
      id: produce.id,
      name: produce.name,
      description: produce.description,
      price: produce.price,
      quantity: produce.quantity,
      unit: produce.unit,
      category: produce.category,
      producer: produce.producer.name,
      aiGenerated: produce.aiGeneratedDescription,
      dateAdded: produce.createdAt.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Error creating produce:", error)
    return NextResponse.json({ error: "Failed to create produce" }, { status: 500 })
  }
}
