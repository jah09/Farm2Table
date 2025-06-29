import { type NextRequest, NextResponse } from "next/server"
import { getAIMarketTrends } from "@/lib/pricing"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || undefined
    const location = searchParams.get("location") || undefined

    const trends = await getAIMarketTrends(category, location)

    return NextResponse.json({
      trends,
      timestamp: new Date().toISOString(),
      filters: { category, location },
      source: "ai-powered",
    })
  } catch (error) {
    console.error("Market trends error:", error)
    return NextResponse.json({ error: "Failed to get market trends" }, { status: 500 })
  }
}
