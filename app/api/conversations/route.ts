import { type NextRequest, NextResponse } from "next/server"
import { getConversationHistory } from "@/lib/openai"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
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