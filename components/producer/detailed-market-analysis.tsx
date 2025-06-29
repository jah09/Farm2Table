"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  BarChart3, 
  Calendar, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  DollarSign,
  Users,
  Clock,
  Zap
} from "lucide-react"

interface MarketAnalysis {
  analysis: {
    priceAnalysis: {
      currentTrend: string
      trendStrength: string
      pricePrediction: string
      confidence: string
    }
    supplyDemand: {
      currentSupply: string
      demandLevel: string
      seasonalFactors: string[]
      marketBalance: string
    }
    competitiveLandscape: {
      competitorCount: string
      priceRange: string
      differentiationOpportunities: string[]
      marketGaps: string[]
    }
    seasonalPatterns: {
      peakSeasons: string[]
      offSeasons: string[]
      priceVariation: string
      volumeVariation: string
    }
    riskFactors: {
      highRisk: string[]
      mediumRisk: string[]
      opportunities: string[]
    }
    strategicRecommendations: {
      pricing: string[]
      production: string[]
      marketing: string[]
      timing: string[]
    }
  }
  summary: string
  confidence: string
}

export function DetailedMarketAnalysis() {
  const [produceName, setProduceName] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAnalysis = async () => {
    if (!produceName.trim()) {
      setError("Please enter a produce name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/market-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produceName: produceName.trim(),
          category: category === "all" ? undefined : category || undefined,
          location: location === "all" ? undefined : location || undefined,
          analysisType: "comprehensive",
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      setError("Failed to generate analysis. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">AI Market Analysis</h2>
        <p className="text-gray-600">Get detailed market insights and strategic recommendations for your produce</p>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Market Analysis</CardTitle>
          <CardDescription>Enter your produce details to get AI-powered market insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="produce">Produce Name *</Label>
              <Input
                id="produce"
                placeholder="e.g., Organic Tomatoes"
                value={produceName}
                onChange={(e) => setProduceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="leafy-greens">Leafy Greens</SelectItem>
                  <SelectItem value="root-vegetables">Root Vegetables</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="benguet">Benguet</SelectItem>
                  <SelectItem value="laguna">Laguna</SelectItem>
                  <SelectItem value="cavite">Cavite</SelectItem>
                  <SelectItem value="bulacan">Bulacan</SelectItem>
                  <SelectItem value="pampanga">Pampanga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button 
            onClick={handleAnalysis} 
            disabled={isLoading || !produceName.trim()}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-blue-800">Market Analysis Summary</CardTitle>
                  <CardDescription>AI-powered insights for {produceName}</CardDescription>
                </div>
                <Badge className={getConfidenceColor(analysis.confidence)}>
                  {analysis.confidence} Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="price" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="supply" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Supply
              </TabsTrigger>
              <TabsTrigger value="competition" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Competition
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Seasonal
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risks
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Strategy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Price Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Trend</Label>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(analysis.analysis.priceAnalysis.currentTrend)}
                        <span className="capitalize">{analysis.analysis.priceAnalysis.currentTrend}</span>
                        <Badge variant="outline">{analysis.analysis.priceAnalysis.trendStrength}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Prediction</Label>
                      <p className="text-sm text-gray-700">{analysis.analysis.priceAnalysis.pricePrediction}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supply" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Supply & Demand Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Supply</Label>
                      <Badge variant="outline" className="capitalize">{analysis.analysis.supplyDemand.currentSupply}</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Demand Level</Label>
                      <Badge variant="outline" className="capitalize">{analysis.analysis.supplyDemand.demandLevel}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Market Balance</Label>
                    <p className="text-sm text-gray-700 capitalize">{analysis.analysis.supplyDemand.marketBalance}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Seasonal Factors</Label>
                    <ul className="space-y-1">
                      {analysis.analysis.supplyDemand.seasonalFactors.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Competitive Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Competitor Count</Label>
                      <p className="text-sm text-gray-700">{analysis.analysis.competitiveLandscape.competitorCount}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Range</Label>
                      <p className="text-sm text-gray-700">{analysis.analysis.competitiveLandscape.priceRange}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Differentiation Opportunities</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.competitiveLandscape.differentiationOpportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Market Gaps</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.competitiveLandscape.marketGaps.map((gap, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Seasonal Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Peak Seasons</Label>
                      <div className="flex flex-wrap gap-1">
                        {analysis.analysis.seasonalPatterns.peakSeasons.map((season, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Off Seasons</Label>
                      <div className="flex flex-wrap gap-1">
                        {analysis.analysis.seasonalPatterns.offSeasons.map((season, i) => (
                          <Badge key={i} variant="outline" className="bg-red-50 text-red-700">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Variation</Label>
                      <p className="text-sm text-gray-700">{analysis.analysis.seasonalPatterns.priceVariation}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Volume Variation</Label>
                      <p className="text-sm text-gray-700">{analysis.analysis.seasonalPatterns.volumeVariation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-red-700">High Risk Factors</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.riskFactors.highRisk.map((risk, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-yellow-700">Medium Risk Factors</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.riskFactors.mediumRisk.map((risk, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-700">Opportunities</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.riskFactors.opportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Pricing Strategy</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.strategicRecommendations.pricing.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Production Strategy</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.strategicRecommendations.production.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Marketing Strategy</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.strategicRecommendations.marketing.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Timing Strategy</Label>
                      <ul className="space-y-1">
                        {analysis.analysis.strategicRecommendations.timing.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-orange-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
} 