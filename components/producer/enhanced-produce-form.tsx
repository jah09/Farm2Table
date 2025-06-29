"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Sparkles, Loader2, X } from "lucide-react"

interface EnhancedProduceFormProps {
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function EnhancedProduceForm({ onSubmit, isSubmitting }: EnhancedProduceFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    subCategory: "",
    season: "",
    farmingMethod: "",
    location: "",
    shelfLife: "",
    storageInstructions: "",
    preparationTips: "",
  })

  const [nutritionalHighlights, setNutritionalHighlights] = useState<string[]>([])
  const [commonUses, setCommonUses] = useState<string[]>([])
  const [newNutrition, setNewNutrition] = useState("")
  const [newUse, setNewUse] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.quantity) return

    await onSubmit({
      ...formData,
      price: Number.parseFloat(formData.price),
      quantity: Number.parseInt(formData.quantity),
      nutritionalHighlights,
      commonUses,
    })

    // Reset form
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: "",
      subCategory: "",
      season: "",
      farmingMethod: "",
      location: "",
      shelfLife: "",
      storageInstructions: "",
      preparationTips: "",
    })
    setNutritionalHighlights([])
    setCommonUses([])
  }

  const addNutritionalHighlight = () => {
    if (newNutrition.trim() && !nutritionalHighlights.includes(newNutrition.trim())) {
      setNutritionalHighlights([...nutritionalHighlights, newNutrition.trim()])
      setNewNutrition("")
    }
  }

  const addCommonUse = () => {
    if (newUse.trim() && !commonUses.includes(newUse.trim())) {
      setCommonUses([...commonUses, newUse.trim()])
      setNewUse("")
    }
  }

  const removeNutrition = (index: number) => {
    setNutritionalHighlights(nutritionalHighlights.filter((_, i) => i !== index))
  }

  const removeUse = (index: number) => {
    setCommonUses(commonUses.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add New Produce
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-600" />
          AI will generate rich descriptions using all the details you provide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Produce Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Organic Cherry Tomatoes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-green-200 focus:border-green-400"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="120"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-green-200 focus:border-green-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="border-green-200 focus:border-green-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Categorization */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Categorization</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Herbs">Herbs</SelectItem>
                    <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                    <SelectItem value="Root Vegetables">Root Vegetables</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub-category</Label>
                <Input
                  id="subCategory"
                  placeholder="e.g., Cherry, Heirloom, Roma"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  className="border-green-200 focus:border-green-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Growing Context */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Growing Context</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                    <SelectItem value="Year-round">Year-round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmingMethod">Farming Method</Label>
                <Select
                  value={formData.farmingMethod}
                  onValueChange={(value) => setFormData({ ...formData, farmingMethod: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Organic">Organic</SelectItem>
                    <SelectItem value="Hydroponic">Hydroponic</SelectItem>
                    <SelectItem value="Conventional">Conventional</SelectItem>
                    <SelectItem value="Biodynamic">Biodynamic</SelectItem>
                    <SelectItem value="Permaculture">Permaculture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Benguet, Baguio City"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-green-200 focus:border-green-400"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Nutritional Highlights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Nutritional Highlights</h3>

            <div className="flex gap-2">
              <Input
                placeholder="e.g., High in Vitamin C"
                value={newNutrition}
                onChange={(e) => setNewNutrition(e.target.value)}
                className="border-green-200 focus:border-green-400"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNutritionalHighlight())}
                disabled={isSubmitting}
              />
              <Button type="button" onClick={addNutritionalHighlight} variant="outline" disabled={isSubmitting}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {nutritionalHighlights.map((highlight, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {highlight}
                  <button
                    type="button"
                    onClick={() => removeNutrition(index)}
                    className="ml-1 hover:text-blue-900"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Common Uses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Common Uses</h3>

            <div className="flex gap-2">
              <Input
                placeholder="e.g., Salads, Cooking, Juicing"
                value={newUse}
                onChange={(e) => setNewUse(e.target.value)}
                className="border-green-200 focus:border-green-400"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCommonUse())}
                disabled={isSubmitting}
              />
              <Button type="button" onClick={addCommonUse} variant="outline" disabled={isSubmitting}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {commonUses.map((use, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {use}
                  <button
                    type="button"
                    onClick={() => removeUse(index)}
                    className="ml-1 hover:text-green-900"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Storage & Preparation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-800">Storage & Preparation</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shelfLife">Shelf Life</Label>
                <Input
                  id="shelfLife"
                  placeholder="e.g., 3-5 days, 1 week"
                  value={formData.shelfLife}
                  onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                  className="border-green-200 focus:border-green-400"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageInstructions">Storage</Label>
                <Input
                  id="storageInstructions"
                  placeholder="e.g., Refrigerate, Room temperature"
                  value={formData.storageInstructions}
                  onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                  className="border-green-200 focus:border-green-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationTips">Preparation Tips</Label>
              <Textarea
                id="preparationTips"
                placeholder="e.g., Wash thoroughly before use, Remove stems..."
                value={formData.preparationTips}
                onChange={(e) => setFormData({ ...formData, preparationTips: e.target.value })}
                className="border-green-200 focus:border-green-400"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Rich AI Description...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Produce with AI Enhancement
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
