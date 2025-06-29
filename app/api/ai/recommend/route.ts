import { type NextRequest, NextResponse } from "next/server"
import { getContextualRecommendations } from "@/lib/embeddings"
import { 
  saveAIConversation, 
  getConversationHistory,
  getProduceRecommendation,
  type ConversationContext,
  type ConversationMetadata 
} from "@/lib/openai"
import { prisma } from "@/lib/prisma"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

export async function POST(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const { question, userId, sessionId, context } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Get conversation history for context
    const conversationHistory = await getConversationHistory(userId, sessionId, 5)
    const previousQuestions = conversationHistory.map(conv => conv.question)

    // Build enhanced context
    const enhancedContext: ConversationContext = {
      userId,
      sessionId,
      previousQuestions,
      ...context
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

    // Get AI recommendation with context
    const startTime = Date.now()
    const aiResponse = await getProduceRecommendation(question, formattedProduces, enhancedContext)
    const responseTime = Date.now() - startTime

    // Get semantic recommendations using embeddings
    const { recommendations, explanation } = await getContextualRecommendations(question, {
      location: context?.location,
      preferences: context?.userPreferences,
      season: context?.season
    })

    // Build metadata for conversation storage
    const metadata: ConversationMetadata = {
      produceIds: recommendations.map((r: any) => r.id),
      categories: [...new Set(recommendations.map((r: any) => r.category).filter(Boolean))],
      priceRange: recommendations.length > 0 ? {
        min: Math.min(...recommendations.map((r: any) => r.price)),
        max: Math.max(...recommendations.map((r: any) => r.price))
      } : undefined,
      farmingMethods: [...new Set(recommendations.map((r: any) => r.farmingMethod).filter(Boolean))],
      seasons: [...new Set(recommendations.map((r: any) => r.season).filter(Boolean))],
      responseTime,
      modelUsed: "gpt-3.5-turbo",
    }

    // Save conversation with enhanced data
    await saveAIConversation(
      question, 
      aiResponse, 
      userId, 
      sessionId, 
      enhancedContext, 
      metadata
    )

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      method: "semantic_search_with_context",
      sessionId,
      conversationHistory: conversationHistory.slice(0, 3), // Return recent history
    })
  } catch (error) {
    console.error("AI recommendation error:", error)
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 })
  }
}
