"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, LogOut, Search, ShoppingCart, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/consumer/cart-context"
import { useProduce } from "@/components/shared/produce-context"
import { Logo } from "@/components/shared/logo"

export function ConsumerBrowse() {
  const router = useRouter()
  const { addToCart, cart, updateQuantity } = useCart()
  const { produces } = useProduce()
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return

    setIsLoading(true)

    setTimeout(() => {
      let response = ""

      if (aiQuestion.toLowerCase().includes("juicing")) {
        response =
          "For juicing, I recommend the Sweet Carrots and Fresh Spinach! Carrots provide natural sweetness and beta-carotene, while spinach adds iron and vitamins. Both are currently available and fresh from local farms."
      } else if (aiQuestion.toLowerCase().includes("salad")) {
        response =
          "Perfect for salads! Try the Fresh Tomatoes and Green Lettuce combination. The cherry tomatoes are organic and add great flavor, while the romaine lettuce provides a crisp base. Both are freshly harvested."
      } else if (aiQuestion.toLowerCase().includes("cooking")) {
        response =
          "For cooking, the Sweet Carrots are excellent - they're versatile and can be roasted, steamed, or added to stews. The Fresh Spinach is also great for sautéing or adding to pasta dishes."
      } else {
        response =
          "Based on what's available, I'd recommend trying the Fresh Tomatoes for their organic quality, or the Sweet Carrots which are great for both cooking and juicing. All our produce is locally sourced and fresh!"
      }

      setAiResponse(response)
      setIsLoading(false)
    }, 1500)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Fresh Produce</h1>
              <p className="text-green-600 mt-1">Discover fresh, local produce ({produces.length} items available)</p>
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* AI Assistant */}
          <div className="lg:col-span-1">
            <Card className="border-green-200 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
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
                    disabled={isLoading || !aiQuestion.trim()}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">AI Recommendation:</h4>
                    <p className="text-sm text-green-700">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Produce Grid */}
          <div className="lg:col-span-2">
            {produces.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">No produce available</h2>
                <p className="text-green-600">Check back later for fresh produce from local farmers!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {produces.map((produce) => {
                  const cartQuantity = getCartQuantity(produce.id)
                  return (
                    <Card key={produce.id} className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-green-800">{produce.name}</CardTitle>
                          <Badge className="bg-green-600 hover:bg-green-700">₱{produce.price}/kg</Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600">by {produce.producer}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{produce.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            {produce.quantity}kg available
                          </Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            Added: {produce.dateAdded}
                          </Badge>
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
                                {cartQuantity}kg
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
