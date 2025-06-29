"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, LogOut, Sparkles, MapPin, Calendar, Leaf, BarChart3, TrendingUp, MessageSquare, Search } from "lucide-react"
import { useProduce } from "@/components/shared/produce-context"
import { useUser } from "@/components/shared/user-context"
import { Logo } from "@/components/shared/logo"
import { EnhancedProduceForm } from "./enhanced-produce-form"
import { PricingAssistant } from "./pricing-assistant"
import { MarketTrendsDashboard } from "./market-trends-dashboard"
import { DetailedMarketAnalysis } from "./detailed-market-analysis"
import { KnowledgeBaseManager } from "./knowledge-base-manager"
import { ConversationAnalytics } from "./conversation-analytics"

export function ProducerDashboard() {
  const { user, logout } = useUser()
  const { produces, addProduce, deleteProduce } = useProduce()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  // Use real user data instead of mock
  const currentProducer = user?.farmName || user?.name || "Unknown Farm"
  const myProduces = produces.filter((p) => p.producer === currentProducer)

  // Form state for pricing assistant - connected to the actual form
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: user?.location || "TBD",
    farmingMethod: user?.farmingMethod || "Organic",
    season: "Summer",
    quantity: 50,
  });

  const handleAddProduce = async (produceData: any) => {
    setIsSubmitting(true);
    try {
      // Use selected price from pricing assistant if available
      const finalPrice = selectedPrice || Number.parseFloat(produceData.price);
      
      const payload = {
        ...produceData,
        price: finalPrice,
        producerId: user?.id,
      };

      const response = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save produce");
      const savedProduce = await response.json();
      console.log(JSON.stringify(savedProduce,null ,2))
      
      // Reset form and pricing assistant
      setFormData({
        name: "",
        category: "",
        location: user?.location || "TBD",
        farmingMethod: user?.farmingMethod || "Organic",
        season: "Summer",
        quantity: 50,
      });
      setSelectedPrice(null);
    } catch (error) {
      console.error("Error adding produce:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduce = (id: string) => {
    deleteProduce(id);
  };

  const handleLogout = () => {
    logout()
  }

  // Handle form changes from the enhanced produce form
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle price selection from pricing assistant
  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price);
  };

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
              <h1 className="text-3xl font-bold text-green-800">Producer Dashboard</h1>
              <p className="text-green-600 mt-1">Welcome back, {user.name}!</p>
              {user.farmName && (
                <p className="text-green-500 text-sm">{user.farmName}</p>
              )}
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
          <TabsList className="grid w-full grid-cols-5 max-w-4xl">
            <TabsTrigger value="add-produce" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Add Produce
            </TabsTrigger>
            <TabsTrigger
              value="market-trends"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Market Trends
            </TabsTrigger>
            <TabsTrigger
              value="my-listings"
              className="flex items-center gap-2"
            >
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
                <EnhancedProduceForm
                  onSubmit={handleAddProduce}
                  isSubmitting={isSubmitting}
                  onFormChange={handleFormChange}
                  selectedPrice={selectedPrice}
                />
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
                  onPriceSelect={handlePriceSelect}
                />
              </div>
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="market-trends">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Market Overview
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Detailed Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <MarketTrendsDashboard />
              </TabsContent>

              <TabsContent value="detailed">
                <DetailedMarketAnalysis />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Current Produce List */}
              <div className="lg:col-span-2">
                <Card className="border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-800">Your Produce Listings</CardTitle>
                    <CardDescription>
                      Manage your current produce listings and track performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myProduces.length === 0 ? (
                      <div className="text-center py-8">
                        <Leaf className="w-12 h-12 text-green-300 mx-auto mb-4" />
                        <p className="text-green-600">No produce listings yet</p>
                        <p className="text-green-500 text-sm">Add your first produce to get started</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myProduces.map((produce) => (
                          <Card key={produce.id} className="border-green-100">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-green-800">{produce.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {produce.farmingMethod}
                                </Badge>
                              </div>
                              <p className="text-sm text-green-600 mb-2">{produce.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-green-700">₱{produce.price}/{produce.unit}</span>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteProduce(produce.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
  );
}
