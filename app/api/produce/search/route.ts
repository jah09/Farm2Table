import { type NextRequest, NextResponse } from "next/server"
import { findSimilarProduce } from "@/lib/embeddings"

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, filters } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results = await findSimilarProduce(query, filters, limit)

    return NextResponse.json({
      results,
      query,
      count: results.length,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
