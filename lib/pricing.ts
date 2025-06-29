import OpenAI from "openai"
import { prisma } from "./prisma"

export interface PricingData {
  suggestedPrice: number
  priceRange: { min: number; max: number }
  confidence: "high" | "medium" | "low"
  reasoning: string
  marketTrends: {
    trend: "increasing" | "decreasing" | "stable"
    percentage: number
    timeframe: string
  }
  competitorAnalysis: {
    averagePrice: number
    competitorCount: number
    yourPosition: "below" | "average" | "above"
  }
  seasonalFactors: {
    isInSeason: boolean
    seasonalMultiplier: number
    seasonalNote: string
  }
  demandIndicators: {
    searchVolume: "high" | "medium" | "low"
    recentOrders: number
    popularityScore: number
  }
}

export interface PriceTrendData {
  produce: string
  category: string
  currentPrice: number
  priceHistory: Array<{
    date: string
    price: number
    volume: number
  }>
  trend: "up" | "down" | "stable"
  trendPercentage: number
  seasonalPattern: Array<{
    month: string
    averagePrice: number
    volume: number
  }>
  marketInsight?: string
  recommendations?: string[]
}

export async function analyzePricingForProduce(
  produceName: string,
  category: string,
  location: string,
  farmingMethod: string,
  season: string,
  quantity: number,
): Promise<PricingData> {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.warn("Skipping pricing analysis during build time")
    throw new Error("Service not available during build")
  }

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get similar produce from database for comparison
    const similarProduce = await prisma.produce.findMany({
      where: {
        OR: [
          { name: { contains: produceName, mode: "insensitive" } },
          { category: { contains: category, mode: "insensitive" } },
        ],
        isActive: true,
        quantity: { gt: 0 },
      },
      include: {
        producer: {
          select: {
            location: true,
            farmingMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    // Calculate market statistics
    const prices = similarProduce.map((p) => p.price)
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    // Filter by similar characteristics for more accurate comparison
    const exactMatches = similarProduce.filter(
      (p) =>
        p.producer.farmingMethod === farmingMethod ||
        p.producer.location?.includes(location.split(",")[0]) ||
        p.category === category,
    )

    const exactMatchPrices = exactMatches.map((p) => p.price)
    const exactAveragePrice =
      exactMatchPrices.length > 0 ? exactMatchPrices.reduce((a, b) => a + b, 0) / exactMatchPrices.length : averagePrice

    // Generate AI-powered pricing analysis
    const pricingPrompt = `Analyze pricing for this produce item:

Product: ${produceName}
Category: ${category}
Location: ${location}
Farming Method: ${farmingMethod}
Season: ${season}
Quantity Available: ${quantity}kg

Market Data:
- Similar products average price: ₱${averagePrice.toFixed(2)}/kg
- Price range in market: ₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}/kg
- Exact matches average: ₱${exactAveragePrice.toFixed(2)}/kg
- Number of competitors: ${similarProduce.length}

Consider these factors:
1. Farming method premium (organic typically 20-40% higher)
2. Seasonal availability (in-season vs out-of-season)
3. Location advantages (local vs distant)
4. Quality indicators
5. Market positioning

Provide a suggested price in PHP per kg and explain the reasoning in 2-3 sentences.`

    const pricingAnalysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a farm-to-table pricing expert who helps producers set competitive prices based on market data, quality factors, and seasonal trends.",
        },
        {
          role: "user",
          content: pricingPrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const aiReasoning = pricingAnalysis.choices[0]?.message?.content || "Unable to generate pricing analysis."

    // Calculate suggested price based on multiple factors
    const basePrice = exactAveragePrice > 0 ? exactAveragePrice : averagePrice
    let suggestedPrice = basePrice

    // Apply farming method premium
    if (farmingMethod === "Organic") {
      suggestedPrice *= 1.3 // 30% premium for organic
    } else if (farmingMethod === "Hydroponic") {
      suggestedPrice *= 1.2 // 20% premium for hydroponic
    } else if (farmingMethod === "Biodynamic") {
      suggestedPrice *= 1.4 // 40% premium for biodynamic
    }

    // Apply seasonal factors
    const currentMonth = new Date().getMonth()
    const seasonalMultiplier = calculateSeasonalMultiplier(season, currentMonth)
    suggestedPrice *= seasonalMultiplier

    // Apply quantity discount for large quantities
    if (quantity > 50) {
      suggestedPrice *= 0.95 // 5% discount for bulk
    } else if (quantity < 10) {
      suggestedPrice *= 1.1 // 10% premium for scarcity
    }

    // Determine confidence level
    const confidence: "high" | "medium" | "low" =
      similarProduce.length > 10 ? "high" : similarProduce.length > 5 ? "medium" : "low"

    // Calculate trend (simplified - in real app would use historical data)
    const trend = calculateMarketTrend(similarProduce, season)

    // Determine position relative to market
    const yourPosition: "below" | "average" | "above" =
      suggestedPrice < averagePrice * 0.9 ? "below" : suggestedPrice > averagePrice * 1.1 ? "above" : "average"

    return {
      suggestedPrice: Math.round(suggestedPrice),
      priceRange: {
        min: Math.round(suggestedPrice * 0.85),
        max: Math.round(suggestedPrice * 1.15),
      },
      confidence,
      reasoning: aiReasoning,
      marketTrends: {
        trend: trend.direction,
        percentage: trend.percentage,
        timeframe: "last 30 days",
      },
      competitorAnalysis: {
        averagePrice: Math.round(averagePrice),
        competitorCount: similarProduce.length,
        yourPosition,
      },
      seasonalFactors: {
        isInSeason: seasonalMultiplier <= 1.0,
        seasonalMultiplier,
        seasonalNote: getSeasonalNote(season, currentMonth),
      },
      demandIndicators: {
        searchVolume: calculateSearchVolume(produceName, category),
        recentOrders: Math.floor(Math.random() * 20), // Mock data - would be real in production
        popularityScore: calculatePopularityScore(similarProduce.length, averagePrice),
      },
    }
  } catch (error) {
    console.error("Error analyzing pricing:", error)
    throw new Error("Failed to analyze pricing")
  }
}

function calculateSeasonalMultiplier(season: string, currentMonth: number): number {
  const seasonMonths = {
    Spring: [2, 3, 4], // Mar, Apr, May
    Summer: [5, 6, 7], // Jun, Jul, Aug
    Fall: [8, 9, 10], // Sep, Oct, Nov
    Winter: [11, 0, 1], // Dec, Jan, Feb
  }

  if (season === "Year-round") return 1.0

  const currentSeason = Object.entries(seasonMonths).find(([_, months]) => months.includes(currentMonth))?.[0]

  if (currentSeason === season) {
    return 0.9 // 10% discount when in season
  } else {
    return 1.2 // 20% premium when out of season
  }
}

function calculateMarketTrend(
  similarProduce: any[],
  season: string,
): { direction: "increasing" | "decreasing" | "stable"; percentage: number } {
  // Simplified trend calculation - in real app would use historical price data
  const recentPrices = similarProduce.slice(0, 10).map((p) => p.price)
  const olderPrices = similarProduce.slice(10, 20).map((p) => p.price)

  if (recentPrices.length === 0 || olderPrices.length === 0) {
    return { direction: "stable", percentage: 0 }
  }

  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
  const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length

  const percentageChange = ((recentAvg - olderAvg) / olderAvg) * 100

  if (Math.abs(percentageChange) < 5) {
    return { direction: "stable", percentage: Math.abs(percentageChange) }
  } else if (percentageChange > 0) {
    return { direction: "increasing", percentage: percentageChange }
  } else {
    return { direction: "decreasing", percentage: Math.abs(percentageChange) }
  }
}

function getSeasonalNote(season: string, currentMonth: number): string {
  const seasonMonths = {
    Spring: [2, 3, 4],
    Summer: [5, 6, 7],
    Fall: [8, 9, 10],
    Winter: [11, 0, 1],
  }

  if (season === "Year-round") return "Available year-round with stable pricing"

  const currentSeason = Object.entries(seasonMonths).find(([_, months]) => months.includes(currentMonth))?.[0]

  if (currentSeason === season) {
    return `Peak season - expect higher demand and competitive pricing`
  } else {
    return `Off-season - premium pricing due to limited availability`
  }
}

function calculateSearchVolume(produceName: string, category: string): "high" | "medium" | "low" {
  // Mock calculation - in real app would integrate with search analytics
  const popularItems = ["tomato", "lettuce", "carrot", "spinach", "kale"]
  const isPopular = popularItems.some((item) => produceName.toLowerCase().includes(item))

  return isPopular ? "high" : Math.random() > 0.5 ? "medium" : "low"
}

function calculatePopularityScore(competitorCount: number, averagePrice: number): number {
  // Higher competitor count and reasonable price = higher popularity
  const competitorScore = Math.min(competitorCount / 20, 1) * 50
  const priceScore = averagePrice > 50 && averagePrice < 200 ? 30 : 20
  const randomFactor = Math.random() * 20

  return Math.round(competitorScore + priceScore + randomFactor)
}

export async function getMarketTrends(category?: string, location?: string): Promise<PriceTrendData[]> {
  try {
    const whereConditions: any = {
      isActive: true,
      quantity: { gt: 0 },
    }

    if (category) {
      whereConditions.category = { contains: category, mode: "insensitive" }
    }

    if (location) {
      whereConditions.location = { contains: location, mode: "insensitive" }
    }

    const produces = await prisma.produce.findMany({
      where: whereConditions,
      include: {
        producer: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Group by produce name and calculate trends
    const groupedProduce = produces.reduce(
      (acc, produce) => {
        const key = produce.name.toLowerCase()
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(produce)
        return acc
      },
      {} as Record<string, any[]>,
    )

    const trends: PriceTrendData[] = Object.entries(groupedProduce).map(([name, items]) => {
      const prices = items.map((item) => item.price)
      const currentPrice = prices[0] || 0
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length

      // Mock historical data - in real app would come from database
      const priceHistory = generateMockPriceHistory(currentPrice, 30)
      const trend = priceHistory[0].price > priceHistory[priceHistory.length - 1].price ? "up" : "down"
      const trendPercentage = Math.abs(
        ((priceHistory[0].price - priceHistory[priceHistory.length - 1].price) /
          priceHistory[priceHistory.length - 1].price) *
          100,
      )

      return {
        produce: items[0].name,
        category: items[0].category || "Unknown",
        currentPrice,
        priceHistory,
        trend: Math.abs(trendPercentage) < 5 ? "stable" : trend,
        trendPercentage: Math.round(trendPercentage),
        seasonalPattern: generateMockSeasonalPattern(averagePrice),
      }
    })

    return trends.slice(0, 10) // Return top 10 trending items
  } catch (error) {
    console.error("Error getting market trends:", error)
    return []
  }
}

function generateMockPriceHistory(currentPrice: number, days: number) {
  const history = []
  let price = currentPrice

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
    price = Math.max(price * (1 + variation), currentPrice * 0.7) // Don't go below 70% of current

    history.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price),
      volume: Math.floor(Math.random() * 100) + 10,
    })
  }

  return history.reverse()
}

function generateMockSeasonalPattern(averagePrice: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return months.map((month, index) => {
    // Create seasonal variation
    const seasonalMultiplier = 0.8 + 0.4 * Math.sin((index * Math.PI) / 6) // Sine wave for seasonal pattern
    return {
      month,
      averagePrice: Math.round(averagePrice * seasonalMultiplier),
      volume: Math.floor(Math.random() * 200) + 50,
    }
  })
}

export async function getPricingInsights(producerId: string): Promise<any> {
  try {
    const userProduces = await prisma.produce.findMany({
      where: {
        producerId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const insights = {
      totalListings: userProduces.length,
      averagePrice: userProduces.reduce((sum, p) => sum + p.price, 0) / userProduces.length || 0,
      priceRange: {
        min: Math.min(...userProduces.map((p) => p.price)),
        max: Math.max(...userProduces.map((p) => p.price)),
      },
      categories: [...new Set(userProduces.map((p) => p.category).filter(Boolean))],
      recommendations: [
        "Consider seasonal pricing adjustments",
        "Monitor competitor prices weekly",
        "Highlight organic/premium qualities in descriptions",
        "Bundle complementary items for better margins",
      ],
    }

    return insights
  } catch (error) {
    console.error("Error getting pricing insights:", error)
    return null
  }
}

export async function getAIMarketTrends(category?: string, location?: string): Promise<PriceTrendData[]> {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.warn("Skipping AI market trends during build time")
    return getMarketTrends(category, location)
  }

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured, falling back to regular market trends")
      return getMarketTrends(category, location)
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get current market data
    const whereConditions: any = {
      isActive: true,
      quantity: { gt: 0 },
    }

    if (category) {
      whereConditions.category = { contains: category, mode: "insensitive" }
    }

    if (location) {
      whereConditions.location = { contains: location, mode: "insensitive" }
    }

    const produces = await prisma.produce.findMany({
      where: whereConditions,
      include: {
        producer: {
          select: {
            name: true,
            location: true,
            farmingMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    })

    // Group by produce name and calculate current market stats
    const groupedProduce = produces.reduce(
      (acc, produce) => {
        const key = produce.name.toLowerCase()
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(produce)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Get top 10 most active products for AI analysis
    const topProducts = Object.entries(groupedProduce)
      .map(([name, items]) => ({
        name: items[0].name,
        category: items[0].category || "Unknown",
        items,
        currentPrice: items[0].price,
        averagePrice: items.reduce((sum, item) => sum + item.price, 0) / items.length,
        supplierCount: items.length,
        locations: [...new Set(items.map(item => item.producer.location).filter(Boolean))],
        farmingMethods: [...new Set(items.map(item => item.producer.farmingMethod).filter(Boolean))],
      }))
      .sort((a, b) => b.supplierCount - a.supplierCount)
      .slice(0, 10)

    // Prepare market data for AI analysis
    const marketData = topProducts.map(product => ({
      name: product.name,
      category: product.category,
      currentPrice: product.currentPrice,
      averagePrice: product.averagePrice,
      supplierCount: product.supplierCount,
      locations: product.locations,
      farmingMethods: product.farmingMethods,
    }))

    // Generate AI-powered market analysis
    const analysisPrompt = `Analyze the current market trends for these agricultural products in the Philippines:

Market Data:
${marketData.map(product => `
- ${product.name} (${product.category})
  * Current price: ₱${product.currentPrice}/kg
  * Average market price: ₱${product.averagePrice}/kg
  * Number of suppliers: ${product.supplierCount}
  * Locations: ${product.locations.join(', ')}
  * Farming methods: ${product.farmingMethods.join(', ')}
`).join('')}

Current Context:
- Location: ${location || 'Philippines'}
- Category filter: ${category || 'All categories'}
- Analysis date: ${new Date().toLocaleDateString()}

Please provide for each product:
1. Price trend direction (up/down/stable) with percentage change
2. Market insight explaining the trend
3. Seasonal pattern prediction for the next 6 months
4. Recommendations for producers

Format the response as JSON with this structure:
{
  "trends": [
    {
      "produce": "Product Name",
      "category": "Category",
      "currentPrice": 150,
      "trend": "up",
      "trendPercentage": 7,
      "marketInsight": "Brief explanation of the trend",
      "seasonalPattern": [
        {"month": "Jan", "averagePrice": 145, "volume": 40},
        {"month": "Feb", "averagePrice": 140, "volume": 35}
      ],
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  ]
}`

    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market analyst specializing in agricultural commodities in the Philippines. Provide accurate, data-driven insights about price trends, seasonal patterns, and market recommendations. Consider factors like weather, demand patterns, farming methods, and regional supply dynamics.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const aiResponse = aiAnalysis.choices[0]?.message?.content || "{}"
    let aiTrends: any[] = []

    try {
      const parsed = JSON.parse(aiResponse)
      aiTrends = parsed.trends || []
    } catch (error) {
      console.error("Error parsing AI response:", error)
      // Fallback to mock data if AI parsing fails
      return getMarketTrends(category, location)
    }

    // Convert AI analysis to PriceTrendData format
    const trends: PriceTrendData[] = aiTrends.map((aiTrend: any) => {
      const baseProduct = topProducts.find(p => 
        p.name.toLowerCase() === aiTrend.produce.toLowerCase()
      )

      return {
        produce: aiTrend.produce,
        category: aiTrend.category,
        currentPrice: aiTrend.currentPrice,
        priceHistory: generateRealisticPriceHistory(aiTrend.currentPrice, aiTrend.trend, aiTrend.trendPercentage),
        trend: aiTrend.trend,
        trendPercentage: aiTrend.trendPercentage,
        seasonalPattern: aiTrend.seasonalPattern || generateMockSeasonalPattern(aiTrend.currentPrice),
        marketInsight: aiTrend.marketInsight,
        recommendations: aiTrend.recommendations,
      }
    })

    return trends
  } catch (error) {
    console.error("Error getting AI market trends:", error)
    // Fallback to regular market trends if AI fails
    return getMarketTrends(category, location)
  }
}

function generateRealisticPriceHistory(
  currentPrice: number, 
  trend: string, 
  trendPercentage: number
) {
  const history = []
  let price = currentPrice
  const days = 30

  // Calculate the starting price based on trend
  const totalChange = (trendPercentage / 100) * currentPrice
  const startingPrice = trend === "up" 
    ? currentPrice - totalChange 
    : trend === "down" 
      ? currentPrice + totalChange 
      : currentPrice

  price = startingPrice

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))

    // Add realistic daily variation (±3%)
    const dailyVariation = (Math.random() - 0.5) * 0.06
    price = price * (1 + dailyVariation)

    // Ensure price doesn't go below reasonable minimum
    price = Math.max(price, currentPrice * 0.6)

    history.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price),
      volume: Math.floor(Math.random() * 100) + 10,
    })
  }

  return history
}
