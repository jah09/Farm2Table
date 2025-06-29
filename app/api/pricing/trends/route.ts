import { type NextRequest, NextResponse } from "next/server"
import { getMarketTrends } from "@/lib/pricing"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const location = searchParams.get("location") || undefined

    const trends = await getMarketTrends(category, location)

    return NextResponse.json({
      trends,
      timestamp: new Date().toISOString(),
      filters: { category, location },
    })
  } catch (error) {
    console.error("Market trends error:", error)
    return NextResponse.json({ error: "Failed to get market trends" }, { status: 500 })
  }
}
