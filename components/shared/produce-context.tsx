"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Produce {
  id: string
  name: string
  price: number
  quantity: number
  description: string
  producer: string
  dateAdded: string
  category?: string
  aiGenerated?: boolean
  unit?: string
  // Enhanced fields
  subCategory?: string
  season?: string
  farmingMethod?: string
  location?: string
  nutritionalHighlights?: string[]
  commonUses?: string[]
  preparationTips?: string
  storageInstructions?: string
  shelfLife?: string
}

interface ProduceContextType {
  produces: Produce[]
  addProduce: (produce: Omit<Produce, "id" | "dateAdded">) => void
  updateProduce: (id: string, updates: Partial<Produce>) => void
  deleteProduce: (id: string) => void
  getProduceByProducer: (producer: string) => Produce[]
  searchProduce: (query: string) => Promise<Produce[]>
}

const ProduceContext = createContext<ProduceContextType | undefined>(undefined)

export function ProduceProvider({ children }: { children: React.ReactNode }) {
  const [produces, setProduces] = useState<Produce[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProduces = localStorage.getItem("farm2table-produces")
    if (savedProduces) {
      setProduces(JSON.parse(savedProduces))
    } else {
      // Initialize with some sample data with AI-generated descriptions
      const initialProduces: Produce[] = [
        {
          id: "1",
          name: "Fresh Tomatoes",
          price: 120,
          quantity: 50,
          description:
            "Vine-ripened organic cherry tomatoes bursting with natural sweetness and vibrant flavor. Hand-picked at peak freshness, these tomatoes are perfect for salads, cooking, or enjoying fresh off the vine.",
          producer: "Juan Dela Cruz Farm",
          dateAdded: "2024-01-10",
          category: "Vegetables",
          aiGenerated: true,
          unit: "kg",
          subCategory: "Cherry",
          season: "Summer",
          farmingMethod: "Organic",
          location: "Benguet, Philippines",
          nutritionalHighlights: ["Vitamin C", "Lycopene", "Antioxidants"],
          commonUses: ["Salads", "Cooking", "Fresh eating"],
          storageInstructions: "Store at room temperature until ripe, then refrigerate",
          shelfLife: "5-7 days",
        },
        {
          id: "2",
          name: "Green Lettuce",
          price: 80,
          quantity: 30,
          description:
            "Crisp, fresh romaine lettuce grown without pesticides in rich, fertile soil. These nutrient-packed leaves provide the perfect crunch for salads and sandwiches while delivering essential vitamins.",
          producer: "Juan Dela Cruz Farm",
          dateAdded: "2024-01-10",
          category: "Leafy Greens",
          aiGenerated: true,
          unit: "kg",
          subCategory: "Romaine",
          season: "Spring",
          farmingMethod: "Organic",
          location: "Benguet, Philippines",
          nutritionalHighlights: ["Vitamin A", "Folate", "Fiber"],
          commonUses: ["Salads", "Sandwiches", "Wraps"],
          storageInstructions: "Refrigerate in plastic bag",
          shelfLife: "3-5 days",
        },
        {
          id: "3",
          name: "Sweet Carrots",
          price: 100,
          quantity: 25,
          description:
            "Premium orange carrots with natural sweetness and satisfying crunch. Rich in beta-carotene and perfect for juicing, roasting, or adding natural sweetness to your favorite dishes.",
          producer: "Maria Santos Farm",
          dateAdded: "2024-01-12",
          category: "Root Vegetables",
          aiGenerated: true,
          unit: "kg",
          subCategory: "Orange",
          season: "Fall",
          farmingMethod: "Hydroponic",
          location: "Laguna, Philippines",
          nutritionalHighlights: ["Beta-carotene", "Vitamin A", "Fiber"],
          commonUses: ["Juicing", "Roasting", "Cooking"],
          storageInstructions: "Refrigerate in plastic bag",
          shelfLife: "2-3 weeks",
        },
        {
          id: "4",
          name: "Fresh Spinach",
          price: 90,
          quantity: 20,
          description:
            "Tender, nutrient-dense spinach leaves packed with iron, vitamins, and antioxidants. Perfect for smoothies, salads, or sautéing, these fresh greens bring both flavor and nutrition to every meal.",
          producer: "Pedro Garcia Farm",
          dateAdded: "2024-01-12",
          category: "Leafy Greens",
          aiGenerated: true,
          unit: "kg",
          subCategory: "Baby",
          season: "Spring",
          farmingMethod: "Organic",
          location: "Cebu, Philippines",
          nutritionalHighlights: ["Iron", "Vitamin A", "Folate"],
          commonUses: ["Smoothies", "Salads", "Sautéing"],
          storageInstructions: "Refrigerate immediately",
          shelfLife: "3-5 days",
        },
      ]
      setProduces(initialProduces)
      localStorage.setItem("farm2table-produces", JSON.stringify(initialProduces))
    }
  }, [])

  // Save to localStorage whenever produces change
  useEffect(() => {
    if (produces.length > 0) {
      localStorage.setItem("farm2table-produces", JSON.stringify(produces))
    }
  }, [produces])

  const addProduce = (newProduce: Omit<Produce, "id" | "dateAdded">) => {
    const produce: Produce = {
      ...newProduce,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split("T")[0],
      unit: newProduce.unit || "kg",
    }
    setProduces((prev) => [...prev, produce])
  }

  const updateProduce = (id: string, updates: Partial<Produce>) => {
    setProduces((prev) => prev.map((produce) => (produce.id === id ? { ...produce, ...updates } : produce)))
  }

  const deleteProduce = (id: string) => {
    setProduces((prev) => prev.filter((produce) => produce.id !== id))
  }

  const getProduceByProducer = (producer: string) => {
    return produces.filter((produce) => produce.producer === producer)
  }

  const searchProduce = async (query: string): Promise<Produce[]> => {
    // In real implementation, this would call the semantic search API
    // For now, we'll do a simple text search
    const lowercaseQuery = query.toLowerCase()
    return produces.filter(
      (produce) =>
        produce.name.toLowerCase().includes(lowercaseQuery) ||
        produce.description.toLowerCase().includes(lowercaseQuery) ||
        produce.category?.toLowerCase().includes(lowercaseQuery),
    )
  }

  return (
    <ProduceContext.Provider
      value={{
        produces,
        addProduce,
        updateProduce,
        deleteProduce,
        getProduceByProducer,
        searchProduce,
      }}
    >
      {children}
    </ProduceContext.Provider>
  )
}

export function useProduce() {
  const context = useContext(ProduceContext)
  if (context === undefined) {
    throw new Error("useProduce must be used within a ProduceProvider")
  }
  return context
}
