"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, BookOpen, Search, Tag, Edit, Trash2 } from "lucide-react"

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isActive: boolean
  createdAt: string
  similarity?: number
}

const categories = [
  "farming",
  "nutrition", 
  "recipes",
  "storage",
  "general"
]

export function KnowledgeBaseManager() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  })

  // Load knowledge base entries
  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/knowledge?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.results || data.entries || [])
      }
    } catch (error) {
      console.error("Error loading knowledge base:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create or update knowledge entry
  const saveEntry = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags
        })
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        loadEntries()
      } else {
        alert("Failed to save knowledge entry")
      }
    } catch (error) {
      console.error("Error saving knowledge entry:", error)
      alert("Error saving knowledge entry")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: ""
    })
    setEditingEntry(null)
  }

  const openEditDialog = (entry: KnowledgeEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: entry.tags.join(", ")
    })
    setIsDialogOpen(true)
  }

  // Load entries on mount and when search/filter changes
  useEffect(() => {
    loadEntries()
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Knowledge Base Manager
          </h2>
          <p className="text-green-600 mt-1">
            Manage knowledge entries to improve AI recommendations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Knowledge Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
              </DialogTitle>
              <DialogDescription>
                Add information that will help the AI provide better recommendations to customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Organic Farming Benefits"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe the topic in detail..."
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="organic, sustainability, health (comma-separated)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEntry} className="bg-green-600 hover:bg-green-700">
                  {editingEntry ? "Update" : "Create"} Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="border-green-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Entries */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-green-600 mt-2">Loading knowledge base...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">No knowledge entries found</h3>
              <p className="text-green-600">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search terms or filters"
                  : "Add your first knowledge entry to help improve AI recommendations"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="border-green-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-green-800">{entry.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {entry.content.length > 150 
                        ? `${entry.content.substring(0, 150)}...` 
                        : entry.content
                      }
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(entry)}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {entry.category}
                  </Badge>
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {entry.similarity && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {Math.round(entry.similarity * 100)}% match
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 