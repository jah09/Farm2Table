import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const userId = searchParams.get('userId')
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    }
    
    if (userId) {
      where.userId = userId
    }

    // Get all conversations in the time range
    const conversations = await prisma.aIConversation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Get user data for conversations that have userId
    const userIds = conversations.map(c => c.userId).filter((id): id is string => id !== null)
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    }) : []
    
    const userMap = new Map(users.map(u => [u.id, u]))

    // Calculate analytics
    const totalConversations = conversations.length
    
    // Calculate average response time from metadata
    let totalResponseTime = 0
    let responseTimeCount = 0
    const questionCounts: { [key: string]: number } = {}
    const categoryCounts: { [key: string]: number } = {}
    const uniqueUsers = new Set<string>()
    
    conversations.forEach((conv) => {
      // Count unique users
      if (conv.userId) {
        uniqueUsers.add(conv.userId)
      }
      
      // Extract response time from metadata
      if (conv.metadata) {
        try {
          const metadata = JSON.parse(conv.metadata)
          if (metadata.responseTime) {
            totalResponseTime += metadata.responseTime
            responseTimeCount++
          }
          
          // Extract categories
          if (metadata.categories && Array.isArray(metadata.categories)) {
            metadata.categories.forEach((category: string) => {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1
            })
          }
        } catch (e) {
          console.error("Error parsing metadata:", e)
        }
      }
      
      // Count questions (normalize to lowercase for better grouping)
      const normalizedQuestion = conv.question.toLowerCase().trim()
      if (normalizedQuestion) {
        questionCounts[normalizedQuestion] = (questionCounts[normalizedQuestion] || 0) + 1
      }
    })

    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0
    const activeUsers = uniqueUsers.size

    // Get top questions
    const topQuestions = Object.entries(questionCounts)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get popular categories
    const popularCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get recent conversations for display
    const recentConversations = conversations.slice(0, 10).map(conv => ({
      id: conv.id,
      question: conv.question,
      response: conv.response,
      createdAt: conv.createdAt.toISOString(),
      userId: conv.userId,
      userName: conv.userId ? userMap.get(conv.userId)?.name || 'Unknown User' : 'Anonymous'
    }))

    // Calculate daily conversation trends
    const dailyTrends = await prisma.aIConversation.groupBy({
      by: ['createdAt'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const conversationTrends = dailyTrends.map(day => ({
      date: day.createdAt.toISOString().split('T')[0],
      count: day._count.id
    }))

    return NextResponse.json({
      totalConversations,
      averageResponseTime: Math.round(averageResponseTime),
      activeUsers,
      topQuestions,
      popularCategories,
      recentConversations,
      conversationTrends,
      timeRange
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch analytics data" 
    }, { status: 500 })
  }
} 