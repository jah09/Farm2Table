import OpenAI from "openai"
import { PrismaClient } from "@prisma/client"
import { generateEmbedding } from "./embeddings"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const prisma = new PrismaClient()

export interface ConversationContext {
  userId?: string
  sessionId?: string
  previousQuestions?: string[]
  userPreferences?: string[]
  location?: string
  dietaryRestrictions?: string[]
  cookingSkill?: string
}

export interface ConversationMetadata {
  produceIds?: string[]
  categories?: string[]
  priceRange?: { min: number; max: number }
  farmingMethods?: string[]
  seasons?: string[]
  responseTime?: number
  modelUsed?: string
  tokensUsed?: number
}

export async function getProduceRecommendation(
  question: string, 
  availableProduce: any[], 
  context?: ConversationContext
): Promise<string> {
  try {
    const produceList = availableProduce
      .map(
        (p) => `${p.name} - ₱${p.price}/kg, ${p.quantity}kg available, by ${p.producer}, Description: ${p.description}`,
      )
      .join("\n")

    // Get relevant knowledge base entries
    const knowledgeContext = await getRelevantKnowledge(question)
    
    // Build context-aware prompt
    const contextInfo = context ? [
      context.userPreferences?.length && `User preferences: ${context.userPreferences.join(", ")}`,
      context.location && `User location: ${context.location}`,
      context.dietaryRestrictions?.length && `Dietary restrictions: ${context.dietaryRestrictions.join(", ")}`,
      context.cookingSkill && `Cooking skill level: ${context.cookingSkill}`,
      context.previousQuestions?.length && `Previous questions: ${context.previousQuestions.slice(-3).join("; ")}`,
    ].filter(Boolean).join("\n") : ""

    const prompt = `You are a helpful AI assistant for a Farm2Table marketplace. A customer is asking: "${question}"

${contextInfo ? `Customer Context:\n${contextInfo}\n` : ""}

Available produce:
${produceList}

${knowledgeContext ? `Relevant Knowledge:\n${knowledgeContext}\n` : ""}

Please provide a helpful recommendation based on the available produce and customer context. Be specific about which items would work best for their needs, mention the producers, and explain why these items are good choices. Keep the response conversational and under 150 words.

If no produce matches their needs, suggest the closest alternatives available.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable farm-to-table assistant helping customers find the best fresh produce for their needs. Consider their preferences, location, and dietary requirements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    return (
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a recommendation at this time. Please try again."
    )
  } catch (error) {
    console.error("OpenAI API error:", error)
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment."
  }
}

export async function saveAIConversation(
  question: string, 
  response: string, 
  userId?: string,
  sessionId?: string,
  context?: ConversationContext,
  metadata?: ConversationMetadata
) {
  try {
    await prisma.aIConversation.create({
      data: {
        question,
        response,
        userId,
        sessionId,
        context: context ? JSON.stringify(context) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    console.error("Error saving AI conversation:", error)
  }
}

export async function getConversationHistory(
  userId?: string,
  sessionId?: string,
  limit: number = 10
) {
  try {
    const where: any = {}
    if (userId) where.userId = userId
    if (sessionId) where.sessionId = sessionId

    return await prisma.aIConversation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching conversation history:", error)
    return []
  }
}

export async function getRelevantKnowledge(query: string, limit: number = 3): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Find similar knowledge base entries
    const knowledgeEntries = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
      },
    })

    if (knowledgeEntries.length === 0) {
      return ""
    }

    // Calculate similarity and get top matches
    const entriesWithSimilarity = knowledgeEntries.map((entry: any) => {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding)
      return { ...entry, similarity }
    })

    const topEntries = entriesWithSimilarity
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit)

    return topEntries
      .map((entry: any) => `${entry.title}: ${entry.content}`)
      .join("\n\n")
  } catch (error) {
    console.error("Error getting relevant knowledge:", error)
    return ""
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

export async function createKnowledgeEntry(
  title: string,
  content: string,
  category: string,
  tags: string[] = []
): Promise<any> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(`${title} ${content}`)

    return await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        category,
        tags,
        embedding,
      },
    })
  } catch (error) {
    console.error("Error creating knowledge entry:", error)
    throw error
  }
}

export async function searchKnowledgeBase(
  query: string,
  category?: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)

    const whereConditions: any = {
      isActive: true,
    }

    if (category) {
      whereConditions.category = category
    }

    const entries = await prisma.knowledgeBase.findMany({
      where: whereConditions,
    })

    const entriesWithSimilarity = entries.map((entry: any) => {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding)
      return { ...entry, similarity }
    })

    return entriesWithSimilarity
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit)
  } catch (error) {
    console.error("Error searching knowledge base:", error)
    return []
  }
}
