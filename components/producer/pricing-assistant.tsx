"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Lightbulb,
  Target,
  Calendar,
  Users,
  Search,
  Loader2,
} from "lucide-react"
import type { PricingData } from "@/lib/pricing"

interface PricingAssistantProps {
  produceName: string
  category: string
  location: string
  farmingMethod: string
  season: string
  quantity: number
  onPriceSelect: (price: number) => void
}

export function PricingAssistant({
  produceName,
  category,
  location,
  farmingMethod,
  season,
  quantity,
  onPriceSelect,
}: PricingAssistantProps) {
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  const analyzePricing = async () => {
    if (!produceName || !category) return

    setIsLoading(true)
    try {
      // In real implementation, this would call the API
      // For now, we'll simulate the analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock pricing data - in real app would come from API
      const mockPricingData: PricingData = {
        suggestedPrice: farmingMethod === "Organic" ? 150 : 120,
        priceRange: { min: farmingMethod === "Organic" ? 130 : 100, max: farmingMethod === "Organic" ? 180 : 140 },
        confidence: "high",
        reasoning: `Based on market analysis, ${produceName} from ${location} using ${farmingMethod} methods should be priced at a premium. Current market shows strong demand for ${season} produce with ${farmingMethod.toLowerCase()} certification. Your location advantage and quality indicators support higher pricing.`,
        marketTrends: {
          trend: "increasing",
          percentage: 8.5,
          timeframe: "last 30 days",
        },
        competitorAnalysis: {
          averagePrice: farmingMethod === "Organic" ? 135 : 110,
          competitorCount: 12,
          yourPosition: "above",
        },
        seasonalFactors: {
          isInSeason: season === "Summer" || season === "Year-round",
          seasonalMultiplier: season === "Summer" ? 0.9 : 1.2,
          seasonalNote:
            season === "Summer"
              ? "Peak season - expect higher demand and competitive pricing"
              : "Off-season - premium pricing due to limited availability",
        },
        demandIndicators: {
          searchVolume: "high",
          recentOrders: 15,
          popularityScore: 78,
        },
      }

      setPricingData(mockPricingData)
      setSelectedPrice(mockPricingData.suggestedPrice)
    } catch (error) {
      console.error("Error analyzing pricing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (produceName && category) {
      analyzePricing()
    }
  }, [produceName, category, location, farmingMethod, season, quantity])

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price)
    onPriceSelect(price)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  if (!produceName || !category) {
    return (
      <Card className="border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Smart Pricing Assistant
          </CardTitle>
          <CardDescription>Fill in produce details to get AI-powered pricing recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter produce name and category to start pricing analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Smart Pricing Assistant
        </CardTitle>
        <CardDescription>AI-powered pricing recommendations based on market data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Analyzing market data and trends...</p>
          </div>
        ) : pricingData ? (
          <>
            {/* Suggested Price */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800 mb-2">₱{pricingData.suggestedPrice}</div>
              <div className="text-sm text-gray-600 mb-4">Recommended price per kg</div>
              <Badge className={getConfidenceColor(pricingData.confidence)}>{pricingData.confidence} confidence</Badge>
            </div>

            {/* Price Range Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Price Options</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedPrice === pricingData.priceRange.min ? "default" : "outline"}
                  onClick={() => handlePriceSelect(pricingData.priceRange.min)}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="text-xs text-gray-600">Competitive</span>
                  <span className="font-bold">₱{pricingData.priceRange.min}</span>
                </Button>
                <Button
                  variant={selectedPrice === pricingData.suggestedPrice ? "default" : "outline"}
                  onClick={() => handlePriceSelect(pricingData.suggestedPrice)}
                  className="flex flex-col h-auto py-3 border-blue-300"
                >
                  <span className="text-xs text-gray-600">Recommended</span>
                  <span className="font-bold">₱{pricingData.suggestedPrice}</span>
                </Button>
                <Button
                  variant={selectedPrice === pricingData.priceRange.max ? "default" : "outline"}
                  onClick={() => handlePriceSelect(pricingData.priceRange.max)}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="text-xs text-gray-600">Premium</span>
                  <span className="font-bold">₱{pricingData.priceRange.max}</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Market Analysis */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Market Analysis
              </h4>

              {/* Market Trends */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Market Trend</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(pricingData.marketTrends.trend)}
                    <span className="text-sm font-semibold">
                      {pricingData.marketTrends.trend} {pricingData.marketTrends.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{pricingData.marketTrends.timeframe}</p>
              </div>

              {/* Competitor Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Competition</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{pricingData.competitorAnalysis.competitorCount} competitors</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Avg: ₱{pricingData.competitorAnalysis.averagePrice}</span>
                  <Badge
                    variant="outline"
                    className={
                      pricingData.competitorAnalysis.yourPosition === "above"
                        ? "border-green-200 text-green-700"
                        : pricingData.competitorAnalysis.yourPosition === "below"
                          ? "border-red-200 text-red-700"
                          : "border-gray-200 text-gray-700"
                    }
                  >
                    Your position: {pricingData.competitorAnalysis.yourPosition}
                  </Badge>
                </div>
              </div>

              {/* Seasonal Factors */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Seasonal Impact
                  </span>
                  <Badge variant={pricingData.seasonalFactors.isInSeason ? "secondary" : "outline"}>
                    {pricingData.seasonalFactors.isInSeason ? "In Season" : "Off Season"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{pricingData.seasonalFactors.seasonalNote}</p>
              </div>

              {/* Demand Indicators */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    <Search className="w-4 h-4 mr-1" />
                    Demand Signals
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      Score: {pricingData.demandIndicators.popularityScore}/100
                    </div>
                    <div className="text-xs text-gray-600">
                      {pricingData.demandIndicators.searchVolume} search volume
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {pricingData.demandIndicators.recentOrders} recent orders in your area
                </p>
              </div>
            </div>

            <Separator />

            {/* AI Reasoning */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                AI Analysis
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">{pricingData.reasoning}</p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Pricing Tips
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    {farmingMethod === "Organic"
                      ? "Highlight organic certification to justify premium pricing"
                      : "Consider organic certification for 20-40% price premium"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Monitor competitor prices weekly and adjust seasonally for optimal margins
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Bundle with complementary items or offer quantity discounts for larger orders
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Button onClick={analyzePricing} className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze Pricing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
