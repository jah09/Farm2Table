import { type NextRequest, NextResponse } from "next/server"
import { getAIMarketTrends } from "@/lib/pricing"

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

export async function GET(request: NextRequest) {
  // Skip execution during build time
  if (isBuildTime) {
    return NextResponse.json({ error: "Service not available during build" }, { status: 503 })
  }

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
