import { type NextRequest, NextResponse } from "next/server"
import { getSemanticRecommendations } from "@/lib/embeddings"
import { saveAIConversation } from "@/lib/openai"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { question, userId } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Get available produce
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
    })

    const formattedProduces = produces.map((produce) => ({
      id: produce.id,
      name: produce.name,
      description: produce.description,
      price: produce.price,
      quantity: produce.quantity,
      unit: produce.unit,
      producer: produce.producer.name,
    }))

    // Get semantic recommendations using embeddings
    const { recommendations, explanation } = await getSemanticRecommendations(question, formattedProduces)

    // Save conversation
    await saveAIConversation(question, explanation, userId)

    return NextResponse.json({
      response: explanation,
      recommendations,
      method: "semantic_search",
    })
  } catch (error) {
    console.error("AI recommendation error:", error)
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 })
  }
}
