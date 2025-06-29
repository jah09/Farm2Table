"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Leaf, RefreshCw, DollarSign, Lightbulb, Target } from "lucide-react"
import type { PriceTrendData } from "@/lib/pricing"

export function MarketTrendsDashboard() {
  const [trends, setTrends] = useState<PriceTrendData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const loadTrends = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedLocation !== "all") params.append("location", selectedLocation)

      const response = await fetch(`/api/pricing/trends?${params.toString()}`)
      const data = await response.json()

      if (data.trends) {
        setTrends(data.trends)
        setLastUpdated(data.timestamp)
      }
    } catch (error) {
      console.error("Error loading trends:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTrends()
  }, [selectedCategory, selectedLocation])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTrendBadgeColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "bg-green-100 text-green-800"
      case "down":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI-Powered Market Trends</h2>
          <p className="text-gray-600">Real-time pricing insights and market analysis powered by OpenAI</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={loadTrends} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="leafy-greens">Leafy Greens</SelectItem>
            <SelectItem value="root-vegetables">Root Vegetables</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="benguet">Benguet</SelectItem>
            <SelectItem value="laguna">Laguna</SelectItem>
            <SelectItem value="cavite">Cavite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trends Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend, index) => (
          <Card key={index} className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-800">{trend.produce}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Leaf className="w-3 h-3" />
                    {trend.category}
                  </CardDescription>
                </div>
                <Badge className={getTrendBadgeColor(trend.trend)}>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend.trend)}
                    {trend.trendPercentage}%
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Price */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
                  <DollarSign className="w-5 h-5" />₱{trend.currentPrice}
                </div>
                <p className="text-sm text-gray-600">Current price per kg</p>
              </div>

              {/* Price History Mini Chart */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  30-Day Trend
                </h4>
                <div className="flex items-end justify-between h-16 bg-gray-50 rounded p-2">
                  {trend.priceHistory.slice(-7).map((point, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(point.price / Math.max(...trend.priceHistory.map((p) => p.price))) * 100}%`,
                        width: "12px",
                      }}
                      title={`${point.date}: ₱${point.price}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{trend.priceHistory[0]?.date}</span>
                  <span className={getTrendColor(trend.trend)}>
                    {trend.trend === "up" ? "↗" : trend.trend === "down" ? "↘" : "→"} {trend.trendPercentage}%
                  </span>
                </div>
              </div>

              {/* AI Market Insight */}
              {trend.marketInsight && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4" />
                    AI Market Insight
                  </h4>
                  <p className="text-xs text-blue-700">{trend.marketInsight}</p>
                </div>
              )}

              {/* AI Recommendations */}
              {trend.recommendations && trend.recommendations.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {trend.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                        <span className="text-green-600 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Seasonal Pattern Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Seasonal Pattern
                </h4>
                <div className="grid grid-cols-6 gap-1">
                  {trend.seasonalPattern.slice(0, 6).map((month, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-gray-500">{month.month}</div>
                      <div className="text-xs font-semibold">₱{month.averagePrice}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Summary */}
      <Card className="border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-800">AI Market Summary</CardTitle>
          <CardDescription>Key insights and recommendations for producers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{trends.filter((t) => t.trend === "up").length}</div>
              <p className="text-sm text-gray-600">Products trending up</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{trends.filter((t) => t.trend === "down").length}</div>
              <p className="text-sm text-gray-600">Products trending down</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                ₱{Math.round(trends.reduce((sum, t) => sum + t.currentPrice, 0) / trends.length || 0)}
              </div>
              <p className="text-sm text-gray-600">Average market price</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{trends.length}</div>
              <p className="text-sm text-gray-600">Active market segments</p>
            </div>
          </div>
          
          {/* AI Insights Summary */}
          {trends.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                AI-Powered Market Intelligence
              </h4>
              <p className="text-sm text-gray-700">
                This analysis is powered by OpenAI's advanced language models, providing real-time market insights 
                based on current supply data, seasonal patterns, and regional market dynamics. 
                Recommendations are tailored to help you optimize pricing and market positioning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
