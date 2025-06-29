"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, LogOut, Sparkles, MapPin, Calendar, Leaf, BarChart3, TrendingUp, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProduce } from "@/components/shared/produce-context"
import { Logo } from "@/components/shared/logo"
import { EnhancedProduceForm } from "./enhanced-produce-form"
import { PricingAssistant } from "./pricing-assistant"
import { MarketTrendsDashboard } from "./market-trends-dashboard"
import { KnowledgeBaseManager } from "./knowledge-base-manager"
import { ConversationAnalytics } from "./conversation-analytics"

export function ProducerDashboard() {
  const router = useRouter()
  const { produces, addProduce, deleteProduce } = useProduce()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  // Mock current producer - in real app, this would come from auth
  const currentProducer = "Juan Dela Cruz Farm"
  const myProduces = produces.filter((p) => p.producer === currentProducer)

  // Form state for pricing assistant
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "Benguet, Philippines",
    farmingMethod: "Organic",
    season: "Summer",
    quantity: 50,
  })

  const handleAddProduce = async (produceData: any) => {
    setIsSubmitting(true)

    try {
      // Use selected price from pricing assistant if available
      const finalPrice = selectedPrice || produceData.price

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate rich AI description based on all the context
      const contextParts = [
        produceData.farmingMethod && `${produceData.farmingMethod}`,
        produceData.name,
        produceData.location && `from ${produceData.location}`,
        produceData.season && `(${produceData.season} harvest)`,
      ].filter(Boolean)

      const aiDescription = `${contextParts.join(" ")} - ${
        produceData.nutritionalHighlights?.length
          ? `Rich in ${produceData.nutritionalHighlights.slice(0, 2).join(" and ")}.`
          : "Packed with natural goodness."
      } ${
        produceData.commonUses?.length
          ? `Perfect for ${produceData.commonUses.slice(0, 2).join(" and ")}.`
          : "Versatile for all your culinary needs."
      } Hand-picked at peak freshness for maximum flavor and nutrition. ${
        produceData.storageInstructions ? `Best stored ${produceData.storageInstructions.toLowerCase()}.` : ""
      }`

      addProduce({
        ...produceData,
        price: finalPrice,
        description: aiDescription,
        producer: currentProducer,
        aiGenerated: true,
        unit: "kg",
      })

      // Reset selected price
      setSelectedPrice(null)
    } catch (error) {
      console.error("Error adding produce:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduce = (id: string) => {
    deleteProduce(id)
  }

  const handleLogout = () => {
    router.push("/")
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Producer Dashboard</h1>
              <p className="text-green-600 mt-1">Welcome back, Juan Dela Cruz!</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="add-produce" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="add-produce" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Add Produce
            </TabsTrigger>
            <TabsTrigger value="market-trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Trends
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
          </TabsList>

          {/* Add Produce Tab */}
          <TabsContent value="add-produce">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Enhanced Add Produce Form */}
              <div className="lg:col-span-2">
                <EnhancedProduceForm onSubmit={handleAddProduce} isSubmitting={isSubmitting} />
              </div>

              {/* Smart Pricing Assistant */}
              <div className="lg:col-span-1">
                <PricingAssistant
                  produceName={formData.name}
                  category={formData.category}
                  location={formData.location}
                  farmingMethod={formData.farmingMethod}
                  season={formData.season}
                  quantity={formData.quantity}
                  onPriceSelect={setSelectedPrice}
                />
              </div>
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="market-trends">
            <MarketTrendsDashboard />
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Current Produce List */}
              <div className="lg:col-span-2">
                <Card className="border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-800">Your Produce Listings</CardTitle>
                    <CardDescription>Manage your current listings ({myProduces.length} items)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {myProduces.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500">No produce listed yet</p>
                        </div>
                      ) : (
                        myProduces.map((produce) => (
                          <div key={produce.id} className="border border-green-100 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-green-800">{produce.name}</h3>
                                {produce.aiGenerated && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteProduce(produce.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                ₱{produce.price}/{produce.unit || "kg"}
                              </Badge>
                              <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                {produce.quantity}
                                {produce.unit || "kg"}
                              </Badge>
                              {produce.category && (
                                <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                                  {produce.category}
                                </Badge>
                              )}
                              {produce.farmingMethod && (
                                <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                                  <Leaf className="w-3 h-3 mr-1" />
                                  {produce.farmingMethod}
                                </Badge>
                              )}
                            </div>

                            {produce.season && (
                              <div className="flex items-center gap-1 mb-2">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{produce.season}</span>
                              </div>
                            )}

                            {produce.location && (
                              <div className="flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{produce.location}</span>
                              </div>
                            )}

                            {produce.nutritionalHighlights && produce.nutritionalHighlights.length > 0 && (
                              <div className="mb-2">
                                <div className="flex flex-wrap gap-1">
                                  {produce.nutritionalHighlights.slice(0, 2).map((highlight, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                      {highlight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{produce.description}</p>
                            <p className="text-xs text-gray-500">Added: {produce.dateAdded}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge-base">
            <KnowledgeBaseManager />
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <ConversationAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
