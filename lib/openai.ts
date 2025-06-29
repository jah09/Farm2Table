import OpenAI from "openai"
import { PrismaClient } from "@prisma/client"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const prisma = new PrismaClient()

export async function getProduceRecommendation(question: string, availableProduce: any[]): Promise<string> {
  try {
    const produceList = availableProduce
      .map(
        (p) => `${p.name} - ₱${p.price}/kg, ${p.quantity}kg available, by ${p.producer}, Description: ${p.description}`,
      )
      .join("\n")

    const prompt = `You are a helpful AI assistant for a Farm2Table marketplace. A customer is asking: "${question}"

Available produce:
${produceList}

Please provide a helpful recommendation based on the available produce. Be specific about which items would work best for their needs, mention the producers, and explain why these items are good choices. Keep the response conversational and under 150 words.

If no produce matches their needs, suggest the closest alternatives available.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable farm-to-table assistant helping customers find the best fresh produce for their needs.",
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

export async function saveAIConversation(question: string, response: string, userId?: string) {
  try {
    await prisma.aiConversation.create({
      data: {
        question,
        response,
        userId,
      },
    })
  } catch (error) {
    console.error("Error saving AI conversation:", error)
  }
}
