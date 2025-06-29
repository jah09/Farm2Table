"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Leaf, RefreshCw, DollarSign } from "lucide-react"
import type { PriceTrendData } from "@/lib/pricing"

export function MarketTrendsDashboard() {
  const [trends, setTrends] = useState<PriceTrendData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")

  const loadTrends = async () => {
    setIsLoading(true)
    try {
      // Mock data - in real app would call API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockTrends: PriceTrendData[] = [
        {
          produce: "Organic Cherry Tomatoes",
          category: "Vegetables",
          currentPrice: 150,
          priceHistory: [
            { date: "2024-01-01", price: 140, volume: 45 },
            { date: "2024-01-15", price: 145, volume: 52 },
            { date: "2024-01-30", price: 150, volume: 48 },
          ],
          trend: "up",
          trendPercentage: 7,
          seasonalPattern: [
            { month: "Jan", averagePrice: 145, volume: 40 },
            { month: "Feb", averagePrice: 140, volume: 35 },
            { month: "Mar", averagePrice: 135, volume: 60 },
            { month: "Apr", averagePrice: 130, volume: 80 },
            { month: "May", averagePrice: 125, volume: 95 },
            { month: "Jun", averagePrice: 120, volume: 100 },
          ],
        },
        {
          produce: "Hydroponic Lettuce",
          category: "Leafy Greens",
          currentPrice: 120,
          priceHistory: [
            { date: "2024-01-01", price: 125, volume: 30 },
            { date: "2024-01-15", price: 122, volume: 35 },
            { date: "2024-01-30", price: 120, volume: 40 },
          ],
          trend: "down",
          trendPercentage: 4,
          seasonalPattern: [
            { month: "Jan", averagePrice: 120, volume: 35 },
            { month: "Feb", averagePrice: 118, volume: 40 },
            { month: "Mar", averagePrice: 115, volume: 45 },
            { month: "Apr", averagePrice: 112, volume: 50 },
            { month: "May", averagePrice: 110, volume: 55 },
            { month: "Jun", averagePrice: 108, volume: 60 },
          ],
        },
        {
          produce: "Organic Carrots",
          category: "Root Vegetables",
          currentPrice: 180,
          priceHistory: [
            { date: "2024-01-01", price: 175, volume: 25 },
            { date: "2024-01-15", price: 178, volume: 28 },
            { date: "2024-01-30", price: 180, volume: 30 },
          ],
          trend: "stable",
          trendPercentage: 3,
          seasonalPattern: [
            { month: "Jan", averagePrice: 180, volume: 25 },
            { month: "Feb", averagePrice: 175, volume: 30 },
            { month: "Mar", averagePrice: 170, volume: 35 },
            { month: "Apr", averagePrice: 165, volume: 40 },
            { month: "May", averagePrice: 160, volume: 45 },
            { month: "Jun", averagePrice: 155, volume: 50 },
          ],
        },
      ]

      setTrends(mockTrends)
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
          <h2 className="text-2xl font-bold text-gray-800">Market Trends</h2>
          <p className="text-gray-600">Real-time pricing insights and market analysis</p>
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

              {/* Seasonal Pattern Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Seasonal Pattern
                </h4>
                <div className="grid grid-cols-6 gap-1">
                  {trend.seasonalPattern.map((month, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-gray-500">{month.month}</div>
                      <div className="text-xs font-semibold">₱{month.averagePrice}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Insights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Market Insight</h4>
                <p className="text-xs text-blue-700">
                  {trend.trend === "up"
                    ? `Prices rising due to increased demand. Good time to list ${trend.produce.toLowerCase()}.`
                    : trend.trend === "down"
                      ? `Prices declining. Consider value-added options or wait for seasonal upturn.`
                      : `Stable pricing. Consistent demand with predictable seasonal patterns.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Summary */}
      <Card className="border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-800">Market Summary</CardTitle>
          <CardDescription>Key insights for producers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{trends.filter((t) => t.trend === "up").length}</div>
              <p className="text-sm text-gray-600">Products trending up</p>
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
        </CardContent>
      </Card>
    </div>
  )
}
