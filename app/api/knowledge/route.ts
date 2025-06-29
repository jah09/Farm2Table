import { type NextRequest, NextResponse } from "next/server"
import { 
  createKnowledgeEntry, 
  searchKnowledgeBase 
} from "@/lib/openai"
import { prisma } from "@/lib/prisma"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

export async function GET(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (query) {
      // Search knowledge base
      const results = await searchKnowledgeBase(query, category || undefined, limit)
      return NextResponse.json({ results })
    } else {
      // Get all knowledge base entries
      const entries = await prisma.knowledgeBase.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return NextResponse.json({ entries })
    }
  } catch (error) {
    console.error("Knowledge base search error:", error)
    return NextResponse.json({ error: "Failed to search knowledge base" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

  try {
    const { title, content, category, tags } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json({ 
        error: "Title, content, and category are required" 
      }, { status: 400 })
    }

    const entry = await createKnowledgeEntry(title, content, category, tags || [])

    return NextResponse.json({ 
      message: "Knowledge entry created successfully",
      entry 
    })
  } catch (error) {
    console.error("Knowledge base creation error:", error)
    return NextResponse.json({ error: "Failed to create knowledge entry" }, { status: 500 })
  }
} 