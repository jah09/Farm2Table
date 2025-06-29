"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, TrendingUp, Users, Clock, Search, Filter } from "lucide-react"

interface ConversationAnalytics {
  totalConversations: number
  averageResponseTime: number
  topQuestions: Array<{ question: string; count: number }>
  popularCategories: Array<{ category: string; count: number }>
  recentConversations: Array<{
    id: string
    question: string
    response: string
    createdAt: string
    userId?: string
  }>
}

export function ConversationAnalytics() {
  const [analytics, setAnalytics] = useState<ConversationAnalytics>({
    totalConversations: 0,
    averageResponseTime: 0,
    topQuestions: [],
    popularCategories: [],
    recentConversations: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")

  // Load conversation analytics
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations?limit=50`)
      if (response.ok) {
        const data = await response.json()
        const conversations = data.conversations || []
        
        // Calculate analytics
        const totalConversations = conversations.length
        const averageResponseTime = conversations.length > 0 
          ? conversations.reduce((sum: number, conv: any) => {
              const metadata = conv.metadata ? JSON.parse(conv.metadata) : {}
              return sum + (metadata.responseTime || 0)
            }, 0) / conversations.length
          : 0

        // Extract top questions
        const questionCounts: { [key: string]: number } = {}
        conversations.forEach((conv: any) => {
          const question = conv.question.toLowerCase()
          questionCounts[question] = (questionCounts[question] || 0) + 1
        })
        const topQuestions = Object.entries(questionCounts)
          .map(([question, count]) => ({ question, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Extract popular categories from metadata
        const categoryCounts: { [key: string]: number } = {}
        conversations.forEach((conv: any) => {
          const metadata = conv.metadata ? JSON.parse(conv.metadata) : {}
          const categories = metadata.categories || []
          categories.forEach((category: string) => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
          })
        })
        const popularCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setAnalytics({
          totalConversations,
          averageResponseTime,
          topQuestions,
          popularCategories,
          recentConversations: conversations.slice(0, 10)
        })
      }
    } catch (error) {
      console.error("Error loading conversation analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            AI Conversation Analytics
          </h2>
          <p className="text-green-600 mt-1">
            Insights from customer interactions with the AI assistant
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Conversations</p>
                <p className="text-2xl font-bold text-green-800">
                  {isLoading ? "..." : analytics.totalConversations}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-800">
                  {isLoading ? "..." : `${Math.round(analytics.averageResponseTime)}ms`}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-2xl font-bold text-green-800">
                  {isLoading ? "..." : new Set(analytics.recentConversations.map(c => c.userId).filter(Boolean)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Questions and Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Top Questions
            </CardTitle>
            <CardDescription>Most frequently asked questions by customers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : analytics.topQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No conversation data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.topQuestions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        "{item.question.length > 50 ? item.question.substring(0, 50) + "..." : item.question}"
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {item.count} times
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Popular Categories
            </CardTitle>
            <CardDescription>Most requested produce categories</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : analytics.popularCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.popularCategories.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 capitalize">
                        {item.category}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {item.count} requests
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Recent Conversations</CardTitle>
          <CardDescription>Latest customer interactions with the AI assistant</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : analytics.recentConversations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent conversations</p>
          ) : (
            <div className="space-y-4">
              {analytics.recentConversations.map((conversation) => (
                <div key={conversation.id} className="border border-green-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-green-800">
                      "{conversation.question}"
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {conversation.response.length > 100 
                      ? conversation.response.substring(0, 100) + "..." 
                      : conversation.response
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 