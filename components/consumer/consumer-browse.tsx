"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sparkles, LogOut, Search, ShoppingCart, Plus, Minus, Filter, X, Brain, Zap, History } from "lucide-react"
import { useCart } from "@/components/consumer/cart-context"
import { useProduce } from "@/components/shared/produce-context"
import { useUser } from "@/components/shared/user-context"
import { Logo } from "@/components/shared/logo"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

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
  const { user, logout } = useUser()
  const { addToCart, cart, updateQuantity } = useCart()
  const { produces, searchProduce } = useProduce()
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
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
    location: user?.location || "Manila",
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

  // Update user context when user data changes
  useEffect(() => {
    if (user) {
      setUserContext(prev => ({
        ...prev,
        location: user.location || "Manila"
      }))
    }
  }, [user])

  // Get unique categories, farming methods, and seasons for filters
  const categories = [...new Set(produces.map(p => p.category).filter(Boolean))] as string[]
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
          context: userContext,
          userId: user?.id
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
      performSemanticSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleLogout = () => {
    logout()
  }

  const getCartQuantity = (produceId: string) => {
    const item = cart.find(item => item.id === produceId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (produce: any) => {
    try {
      addToCart({
        id: produce.id,
        name: produce.name,
        price: produce.price,
        quantity: 1,
        unit: getUnit(produce.unit),
        producer: produce.producer || "Unknown Producer",
        maxQuantity: produce.quantity || 100
      })
      
      // Show success feedback
      toast({
        title: "Added to cart",
        description: `${produce.name} has been added to your cart`,
        duration: 2000,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = (produceId: string, newQuantity: number) => {
    try {
      updateQuantity(produceId, newQuantity)
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Debug function to check localStorage
  const debugCart = () => {
    const localStorageCart = localStorage.getItem("farm2table-cart")
    console.log("Current cart state:", cart)
    console.log("localStorage cart:", localStorageCart)
    console.log("localStorage parsed:", localStorageCart ? JSON.parse(localStorageCart) : null)
  }

  // Force refresh cart from localStorage
  const forceRefreshCart = () => {
    const localStorageCart = localStorage.getItem("farm2table-cart")
    if (localStorageCart) {
      try {
        const parsedCart = JSON.parse(localStorageCart)
        console.log("Force refreshing cart from localStorage:", parsedCart)
        // This will trigger a re-render by accessing the cart state
        toast({
          title: "Cart refreshed",
          description: `Loaded ${parsedCart.length} items from localStorage`,
          duration: 2000,
        })
      } catch (error) {
        console.error("Error parsing localStorage cart:", error)
        toast({
          title: "Error",
          description: "Failed to refresh cart from localStorage",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "No cart data",
        description: "No cart data found in localStorage",
        variant: "destructive",
      })
    }
  }

  // Test cart functionality
  const testCart = () => {
    const testItem = {
      id: "test-item-" + Date.now(),
      name: "Test Item",
      price: 100,
      quantity: 1,
      unit: "kg",
      producer: "Test Producer",
      maxQuantity: 10
    }
    
    try {
      addToCart(testItem)
      toast({
        title: "Test item added",
        description: "Test item has been added to cart",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error adding test item:", error)
      toast({
        title: "Error",
        description: "Failed to add test item",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Fresh Produce</h1>
              <p className="text-green-600 mt-1">Welcome, {user.name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/consumer/cart')}
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDebug(!showDebug)}
              className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
            >
              Debug
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

        {/* Debug Panel */}
        {showDebug && (
          <Card className="border-red-200 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-red-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Current Cart State:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(cart, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">localStorage Cart:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {localStorage.getItem("farm2table-cart") || "No data"}
                  </pre>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={debugCart}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Log to Console
                </Button>
                <Button
                  size="sm"
                  onClick={forceRefreshCart}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Force Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={testCart}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Test Cart
                </Button>
                <Button
                  size="sm"
                  onClick={() => localStorage.removeItem("farm2table-cart")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear localStorage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and AI Assistant Section */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <Card className="border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Fresh Produce
                </CardTitle>
                <CardDescription>
                  Search for fresh, local produce from our network of farmers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for produce, recipes, or ask questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-green-200 focus:border-green-400"
                  />
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="text-sm font-medium text-green-700 mb-2 block">Category</label>
                        <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="border-green-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-green-700 mb-2 block">Max Price: ₱{filters.maxPrice}</label>
                        <Slider
                          value={[filters.maxPrice]}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value[0] }))}
                          max={1000}
                          min={50}
                          step={50}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-green-700 mb-2 block">Farming Method</label>
                        <Select value={filters.farmingMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, farmingMethod: value }))}>
                          <SelectTrigger className="border-green-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            {farmingMethods.map(method => (
                              <SelectItem key={method} value={method}>{method}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-green-700 mb-2 block">Season</label>
                        <Select value={filters.season} onValueChange={(value) => setFilters(prev => ({ ...prev, season: value }))}>
                          <SelectTrigger className="border-green-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Seasons</SelectItem>
                            {seasons.map(season => (
                              <SelectItem key={season} value={season}>{season}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-1">
            <Card className="border-green-200 shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask for recommendations and cooking tips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about produce, recipes..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                    className="flex-1 border-green-200 focus:border-green-400"
                    disabled={isAiLoading}
                  />
                  <Button
                    onClick={handleAiQuestion}
                    disabled={isAiLoading || !aiQuestion.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAiLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">{aiResponse}</p>
                  </div>
                )}

                {aiRecommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Recommended for you:</h4>
                    <div className="space-y-2">
                      {aiRecommendations.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-100">
                          <div>
                            <p className="text-sm font-medium text-green-800">{item.name}</p>
                            <p className="text-xs text-green-600">₱{item.price}/{getUnit(item.unit)}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Available Produce"}
            </h2>
            <p className="text-green-600">
              {getFilteredResults().length} items found
            </p>
          </div>

          {isSearching ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-green-100 rounded animate-pulse" />
                      <div className="h-3 bg-green-50 rounded animate-pulse" />
                      <div className="h-3 bg-green-50 rounded w-2/3 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : getFilteredResults().length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">No produce found</h3>
                <p className="text-green-600">
                  {searchQuery 
                    ? `No items match "${searchQuery}". Try adjusting your search or filters.`
                    : "No produce available at the moment. Check back soon!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredResults().map((produce) => (
                <Card key={produce.id} className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800 mb-1">{produce.name}</h3>
                        <p className="text-sm text-green-600 line-clamp-2">{produce.description}</p>
                      </div>
                      {produce.similarity && produce.similarity < 1 && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {Math.round(produce.similarity * 100)}% match
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        ₱{produce.price}/{getUnit(produce.unit)}
                      </Badge>
                      {produce.category && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {produce.category}
                        </Badge>
                      )}
                      {produce.farmingMethod && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                          {produce.farmingMethod}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-600">
                        <p>From: {produce.producer}</p>
                        {produce.location && <p>📍 {produce.location}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {getCartQuantity(produce.id) > 0 && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(produce.id, getCartQuantity(produce.id) - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">{getCartQuantity(produce.id)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(produce.id, getCartQuantity(produce.id) + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(produce)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {getCartQuantity(produce.id) > 0 ? "Add More" : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
