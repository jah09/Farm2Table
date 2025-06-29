"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sparkles, LogOut, Search, ShoppingCart, Plus, Minus, Filter, X, Brain, Zap, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/consumer/cart-context"
import { useProduce } from "@/components/shared/produce-context"
import { Logo } from "@/components/shared/logo"

interface SearchFilters {
  category: string
  maxPrice: number
  farmingMethod: string
  season: string
}

interface SearchResult {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  unit?: string
  category?: string
  subCategory?: string
  season?: string
  farmingMethod?: string
  location?: string
  nutritionalHighlights?: string[]
  commonUses?: string[]
  producer: string
  producerLocation?: string
  similarity?: number
  dateAdded: string
}

// Helper to always return a string unit
function getUnit(unit: string | undefined): string {
  return typeof unit === "string" && unit.length > 0 ? unit : "kg"
}

export function ConsumerBrowse() {
  const router = useRouter()
  const { addToCart, cart, updateQuantity } = useCart()
  const { produces, searchProduce } = useProduce()
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    maxPrice: 500,
    farmingMethod: "all",
    season: "all",
  })
  
  // AI Assistant states
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiRecommendations, setAiRecommendations] = useState<SearchResult[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [userContext, setUserContext] = useState({
    location: "Manila",
    preferences: ["organic", "local"],
    dietaryRestrictions: [],
    cookingSkill: "intermediate"
  })

  // Initialize session ID on component mount
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [sessionId])

  // Get unique categories, farming methods, and seasons for filters
  const categories = [...new Set(produces.map(p => p.category).filter(Boolean))]
  const farmingMethods = ["Organic", "Hydroponic", "Biodynamic", "Conventional"]
  const seasons = ["Spring", "Summer", "Fall", "Winter", "Year-round"]

  // Perform semantic search
  const performSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('/api/produce/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 20 })
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else {
        // Fallback to local search
        const localResults = await searchProduce(query)
        setSearchResults(localResults.map(p => ({
          ...p,
          similarity: 0.8, // Mock similarity score
          unit: p.unit || "kg"
        })))
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to local search
      const localResults = await searchProduce(query)
      setSearchResults(localResults.map(p => ({
        ...p,
        similarity: 0.8,
        unit: p.unit || "kg"
      })))
    } finally {
      setIsSearching(false)
    }
  }

  // Handle AI recommendations with enhanced context
  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return

    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: aiQuestion,
          sessionId,
          context: userContext
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
        setAiRecommendations(data.recommendations || [])
        setConversationHistory(data.conversationHistory || [])
      } else {
        // Fallback to mock response
        setTimeout(() => {
          let response = ""
          if (aiQuestion.toLowerCase().includes("juicing")) {
            response = "For juicing, I recommend the Sweet Carrots and Fresh Spinach! Carrots provide natural sweetness and beta-carotene, while spinach adds iron and vitamins. Both are currently available and fresh from local farms."
          } else if (aiQuestion.toLowerCase().includes("salad")) {
            response = "Perfect for salads! Try the Fresh Tomatoes and Green Lettuce combination. The cherry tomatoes are organic and add great flavor, while the romaine lettuce provides a crisp base. Both are freshly harvested."
          } else if (aiQuestion.toLowerCase().includes("cooking")) {
            response = "For cooking, the Sweet Carrots are excellent - they're versatile and can be roasted, steamed, or added to stews. The Fresh Spinach is also great for sautéing or adding to pasta dishes."
          } else {
            response = "Based on what's available, I'd recommend trying the Fresh Tomatoes for their organic quality, or the Sweet Carrots which are great for both cooking and juicing. All our produce is locally sourced and fresh!"
          }
          setAiResponse(response)
          setIsAiLoading(false)
        }, 1500)
      }
    } catch (error) {
      console.error('AI recommendation error:', error)
      setAiResponse("I'm having trouble connecting right now. Please try again in a moment.")
    } finally {
      setIsAiLoading(false)
    }
  }

  // Apply filters to search results
  const applyFilters = (results: SearchResult[]) => {
    return results.filter(item => {
      if (filters.category && filters.category !== "all" && item.category !== filters.category) return false
      if (filters.maxPrice && item.price > filters.maxPrice) return false
      if (filters.farmingMethod && filters.farmingMethod !== "all" && item.farmingMethod !== filters.farmingMethod) return false
      if (filters.season && filters.season !== "all" && item.season !== filters.season) return false
      return true
    })
  }

  // Get filtered results
  const getFilteredResults = () => {
    const baseResults = searchQuery ? searchResults : produces.map(p => ({
      ...p,
      similarity: 1.0,
      unit: p.unit || "kg"
    }))
    return applyFilters(baseResults)
  }

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSemanticSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleLogout = () => {
    router.push("/")
  }

  const getCartQuantity = (produceId: string) => {
    const item = cart.find((item) => item.id === produceId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (produce: any) => {
    addToCart({
      id: produce.id,
      name: produce.name,
      price: produce.price,
      quantity: 1,
      producer: produce.producer,
      maxQuantity: produce.quantity,
    })
  }

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const filteredResults = getFilteredResults()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Fresh Produce</h1>
              <p className="text-green-600 mt-1">
                Discover fresh, local produce ({filteredResults.length} items available)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/consumer/cart")} className="bg-green-600 hover:bg-green-700 relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, description, or ask naturally (e.g., 'good for juicing', 'organic vegetables')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-green-200 text-green-700 hover:bg-green-50 ${showFilters ? 'bg-green-50' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mt-4 border-green-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">Category</label>
                    <Select value={filters.category || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.filter((c): c is string => !!c).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">Max Price: ₱{filters.maxPrice}</label>
                    <Slider
                      value={[filters.maxPrice]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, maxPrice: value }))}
                      max={500}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">Farming Method</label>
                    <Select value={filters.farmingMethod || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, farmingMethod: value }))}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="All methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All methods</SelectItem>
                        {farmingMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">Season</label>
                    <Select value={filters.season || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, season: value }))}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="All seasons" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All seasons</SelectItem>
                        {seasons.map(season => (
                          <SelectItem key={season} value={season}>{season}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* AI Assistant */}
          <div className="lg:col-span-1">
            <Card className="border-green-200 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Assistant
                </CardTitle>
                <CardDescription>Ask me about the best produce for your needs!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., What's good for juicing?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                    onKeyPress={(e) => e.key === "Enter" && handleAiQuestion()}
                  />
                  <Button
                    onClick={handleAiQuestion}
                    disabled={isAiLoading || !aiQuestion.trim()}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Recommendation:
                    </h4>
                    <p className="text-sm text-green-700 mb-3">{aiResponse}</p>
                    
                    {aiRecommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-green-800 text-xs">Recommended Items:</h5>
                        {aiRecommendations.slice(0, 3).map((item) => (
                          <div key={item.id} className="bg-white rounded p-2 text-xs">
                            <div className="font-medium text-green-800">{item.name}</div>
                            <div className="text-green-600">₱{item.price}/{getUnit(item.unit)} • {item.producer}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 text-xs mb-2 flex items-center">
                      <History className="w-3 h-3 mr-1" />
                      Recent Questions:
                    </h5>
                    <div className="space-y-1">
                      {conversationHistory.slice(0, 2).map((conv, index) => (
                        <div key={index} className="text-xs text-blue-700 bg-white rounded p-1">
                          "{conv.question}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Produce Grid */}
          <div className="lg:col-span-3">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  {searchQuery ? 'No matching produce found' : 'No produce available'}
                </h2>
                <p className="text-green-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters' 
                    : 'Check back later for fresh produce from local farmers!'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredResults.map((produce) => {
                  const cartQuantity = getCartQuantity(produce.id)
                  return (
                    <Card key={produce.id} className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-green-800">{produce.name}</CardTitle>
                          <div className="text-right">
                            <Badge className="bg-green-600 hover:bg-green-700">₱{produce.price}/{getUnit(produce.unit)}</Badge>
                            {produce.similarity && produce.similarity < 1 && (
                              <div className="text-xs text-green-600 mt-1">
                                {Math.round(produce.similarity * 100)}% match
                              </div>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-600">by {produce.producer}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 text-sm">{produce.description}</p>
                        
                        {/* Additional details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                              {produce.quantity}{getUnit(produce.unit)} available
                            </Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                              Added: {produce.dateAdded}
                            </Badge>
                          </div>
                          
                          {produce.farmingMethod && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                              {produce.farmingMethod}
                            </Badge>
                          )}
                          
                          {produce.season && (
                            <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs">
                              {produce.season}
                            </Badge>
                          )}
                        </div>

                        {cartQuantity === 0 ? (
                          <Button
                            onClick={() => handleAddToCart(produce)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(produce.id, cartQuantity - 1)}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-semibold text-green-800 min-w-[2rem] text-center">
                                {cartQuantity}{getUnit(produce.unit)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(produce.id, cartQuantity + 1)}
                                disabled={cartQuantity >= produce.quantity}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              In Cart
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
