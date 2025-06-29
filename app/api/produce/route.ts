import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/middleware"
import { createProduceWithEmbedding } from "@/lib/embeddings"

export async function GET() {
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
      imageUrl: produce.imageUrl,
      producer: produce.producer.name,
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
    const produce = await createProduceWithEmbedding(
      {
        name,
        price: Number.parseFloat(price),
        quantity: Number.parseInt(quantity),
        category,
        producerId: user.id,
      },
      user.name,
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
