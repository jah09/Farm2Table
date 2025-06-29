import { type NextRequest, NextResponse } from "next/server"
import { analyzePricingForProduce } from "@/lib/pricing"
import { verifyAuth } from "@/lib/middleware"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== "PRODUCER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { produceName, category, location, farmingMethod, season, quantity } = await request.json()

    if (!produceName || !category) {
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 })
    }

    const pricingData = await analyzePricingForProduce(
      produceName,
      category,
      location || "Philippines",
      farmingMethod || "Conventional",
      season || "Year-round",
      quantity || 50,
    )

    return NextResponse.json(pricingData)
  } catch (error) {
    console.error("Pricing analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze pricing" }, { status: 500 })
  }
}
