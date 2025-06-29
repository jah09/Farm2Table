import { type NextRequest, NextResponse } from "next/server"
import { getAIMarketTrends } from "@/lib/pricing"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured" 
      }, { status: 500 })
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const body = await request.json()
    const { produceName, category, location, analysisType = "comprehensive" } = body

    if (!produceName) {
      return NextResponse.json({ error: "Produce name is required" }, { status: 400 })
    }

    // Get current market trends for context
    const marketTrends = await getAIMarketTrends(category, location)
    const relevantTrend = marketTrends.find(t => 
      t.produce.toLowerCase().includes(produceName.toLowerCase()) ||
      produceName.toLowerCase().includes(t.produce.toLowerCase())
    )

    // Generate detailed AI analysis
    const analysisPrompt = `Provide a detailed market analysis for ${produceName} in the Philippines.

Context:
- Category: ${category || 'General'}
- Location: ${location || 'Philippines'}
- Analysis Type: ${analysisType}

${relevantTrend ? `
Current Market Data:
- Current Price: ₱${relevantTrend.currentPrice}/kg
- Trend: ${relevantTrend.trend} (${relevantTrend.trendPercentage}%)
- Market Insight: ${relevantTrend.marketInsight}
` : ''}

Please provide a comprehensive analysis including:

1. **Price Analysis**: Current pricing trends and future predictions
2. **Supply & Demand**: Current market conditions and seasonal factors
3. **Competitive Landscape**: Key competitors and market positioning
4. **Seasonal Patterns**: Expected price variations throughout the year
5. **Risk Factors**: Potential challenges and opportunities
6. **Strategic Recommendations**: Actionable advice for producers

Format the response as JSON with this structure:
{
  "analysis": {
    "priceAnalysis": {
      "currentTrend": "up/down/stable",
      "trendStrength": "strong/moderate/weak",
      "pricePrediction": "Expected price range for next 3 months",
      "confidence": "high/medium/low"
    },
    "supplyDemand": {
      "currentSupply": "abundant/moderate/scarce",
      "demandLevel": "high/medium/low",
      "seasonalFactors": ["Factor 1", "Factor 2"],
      "marketBalance": "supply-driven/demand-driven/balanced"
    },
    "competitiveLandscape": {
      "competitorCount": "estimated number",
      "priceRange": "₱min - ₱max",
      "differentiationOpportunities": ["Opportunity 1", "Opportunity 2"],
      "marketGaps": ["Gap 1", "Gap 2"]
    },
    "seasonalPatterns": {
      "peakSeasons": ["Month 1", "Month 2"],
      "offSeasons": ["Month 1", "Month 2"],
      "priceVariation": "Expected % variation",
      "volumeVariation": "Expected volume changes"
    },
    "riskFactors": {
      "highRisk": ["Risk 1", "Risk 2"],
      "mediumRisk": ["Risk 1", "Risk 2"],
      "opportunities": ["Opportunity 1", "Opportunity 2"]
    },
    "strategicRecommendations": {
      "pricing": ["Recommendation 1", "Recommendation 2"],
      "production": ["Recommendation 1", "Recommendation 2"],
      "marketing": ["Recommendation 1", "Recommendation 2"],
      "timing": ["Recommendation 1", "Recommendation 2"]
    }
  },
  "summary": "Brief executive summary of key findings",
  "confidence": "high/medium/low"
}`

    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior agricultural market analyst with deep expertise in Philippine agricultural markets. Provide accurate, data-driven insights that help producers make informed decisions about pricing, production timing, and market positioning. Consider local factors like weather patterns, regional supply chains, and consumer preferences.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.2,
    })

    const aiResponse = aiAnalysis.choices[0]?.message?.content || "{}"
    let analysis: any = {}

    try {
      const parsed = JSON.parse(aiResponse)
      analysis = parsed
    } catch (error) {
      console.error("Error parsing AI analysis response:", error)
      return NextResponse.json({ 
        error: "Failed to parse AI analysis",
        rawResponse: aiResponse 
      }, { status: 500 })
    }

    return NextResponse.json({
      analysis,
      produceName,
      category,
      location,
      timestamp: new Date().toISOString(),
      source: "ai-powered",
    })
  } catch (error) {
    console.error("Market analysis error:", error)
    return NextResponse.json({ error: "Failed to generate market analysis" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured" 
      }, { status: 500 })
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || undefined
    const location = searchParams.get("location") || undefined

    // Get market trends for overview
    const trends = await getAIMarketTrends(category, location)

    // Generate market overview analysis
    const overviewPrompt = `Provide a market overview analysis for agricultural products in the Philippines.

Context:
- Category: ${category || 'All categories'}
- Location: ${location || 'Philippines'}

Market Data Summary:
${trends.slice(0, 5).map(trend => `
- ${trend.produce}: ₱${trend.currentPrice}/kg (${trend.trend} ${trend.trendPercentage}%)
`).join('')}

Please provide:
1. Overall market sentiment
2. Key trends across categories
3. Seasonal opportunities
4. Risk factors to watch
5. Strategic recommendations for producers

Format as JSON:
{
  "marketSentiment": "positive/neutral/negative",
  "keyTrends": ["Trend 1", "Trend 2", "Trend 3"],
  "seasonalOpportunities": ["Opportunity 1", "Opportunity 2"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "strategicRecommendations": ["Recommendation 1", "Recommendation 2"],
  "summary": "Brief market overview"
}`

    const overviewAnalysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market analyst providing high-level insights about agricultural market conditions in the Philippines.",
        },
        {
          role: "user",
          content: overviewPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const overviewResponse = overviewAnalysis.choices[0]?.message?.content || "{}"
    let overview: any = {}

    try {
      const parsed = JSON.parse(overviewResponse)
      overview = parsed
    } catch (error) {
      console.error("Error parsing overview response:", error)
    }

    return NextResponse.json({
      overview,
      trends: trends.slice(0, 10),
      timestamp: new Date().toISOString(),
      source: "ai-powered",
    })
  } catch (error) {
    console.error("Market overview error:", error)
    return NextResponse.json({ error: "Failed to get market overview" }, { status: 500 })
  }
} 