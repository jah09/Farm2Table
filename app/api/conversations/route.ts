import { type NextRequest, NextResponse } from "next/server"
import { getConversationHistory } from "@/lib/openai"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

export async function GET(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId && !sessionId) {
      return NextResponse.json({ 
        error: "Either userId or sessionId is required" 
      }, { status: 400 })
    }

    const conversations = await getConversationHistory(userId || undefined, sessionId || undefined, limit)

    return NextResponse.json({ 
      conversations,
      count: conversations.length
    })
  } catch (error) {
    console.error("Conversation history error:", error)
    return NextResponse.json({ error: "Failed to fetch conversation history" }, { status: 500 })
  }
} 