import OpenAI from "openai";
import { prisma } from "./prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EnhancedProduceInfo {
  name: string;
  description?: string;
  category?: string;
  subCategory?: string;
  season?: string;
  farmingMethod?: string;
  location?: string;
  price: number;
  quantity: number;
  unit: string;
  producer: string;
  nutritionalHighlights?: string[];
  commonUses?: string[];
  preparationTips?: string;
  storageInstructions?: string;
  shelfLife?: string;
}

export async function generateRichProduceDescription(
  produceInfo: EnhancedProduceInfo
): Promise<string> {
  try {
    const contextParts = [
      `Product: ${produceInfo.name}`,
      produceInfo.category && `Category: ${produceInfo.category}`,
      produceInfo.subCategory && `Type: ${produceInfo.subCategory}`,
      produceInfo.farmingMethod && `Farming: ${produceInfo.farmingMethod}`,
      produceInfo.season && `Season: ${produceInfo.season}`,
      produceInfo.location && `Location: ${produceInfo.location}`,
      `Price: ₱${produceInfo.price}/${produceInfo.unit}`,
      `Available: ${produceInfo.quantity}${produceInfo.unit}`,
      `Producer: ${produceInfo.producer}`,
      produceInfo.nutritionalHighlights?.length &&
        `Nutrition: ${produceInfo.nutritionalHighlights.join(", ")}`,
      produceInfo.commonUses?.length &&
        `Uses: ${produceInfo.commonUses.join(", ")}`,
    ].filter(Boolean);

    const prompt = `Generate a compelling, natural description for this fresh produce item:

${contextParts.join("\n")}

Write a 2-3 sentence description that highlights:
- Freshness and quality
- Unique characteristics (farming method, season, location)
- Best uses and nutritional benefits
- What makes this produce special
- Appeal to health-conscious consumers

Keep it natural, engaging, and under 120 words. Focus on the sensory experience and benefits.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert farm-to-table copywriter who creates appealing descriptions for fresh produce, emphasizing quality, nutrition, and local sourcing.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 180,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      `Fresh ${produceInfo.name} from ${produceInfo.producer}. ${
        produceInfo.farmingMethod || "Locally grown"
      } and perfect for your kitchen needs.`
    );
  } catch (error) {
    console.error("Error generating description:", error);
    return `Fresh ${produceInfo.name} from ${produceInfo.producer}. ${
      produceInfo.farmingMethod || "Locally grown"
    } and perfect for your kitchen needs.`;
  }
}

export function createEmbeddingText(
  produce: EnhancedProduceInfo,
  description: string
): string {
  const embeddingParts = [
    // Core identity
    produce.name,
    description,
    produce.location,

    // Categorization
    // produce.category,
    // produce.subCategory,

    // Context and quality
    // produce.farmingMethod,
    // produce.season,
    // produce.location,

    // Usage and benefits
    // produce.nutritionalHighlights?.join(" "),
    // produce.commonUses?.join(" "),
    // produce.preparationTips,
    // produce.storageInstructions,

    // Additional context
    `${produce.producer} farm`,
    `${produce.price} pesos per ${produce.unit}`,
  ].filter(Boolean);

  return embeddingParts.join(" ");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function createEnhancedProduceWithEmbedding(
  produceData: {
    name: string;
    price: number;
    quantity: number;
    category?: string;
    subCategory?: string;
    season?: string;
    farmingMethod?: string;
    location?: string;
    nutritionalHighlights?: string[];
    commonUses?: string[];
    preparationTips?: string;
    storageInstructions?: string;
    shelfLife?: string;
    producerId: string;
    unit?: string;
  },
  producerInfo: { name: string; location?: string; farmingMethod?: string }
): Promise<any> {
  try {
    // Merge producer info with produce data
    const enhancedProduceInfo: EnhancedProduceInfo = {
      ...produceData,
      unit: produceData.unit || "kg",
      producer: producerInfo.name,
      location: produceData.location || producerInfo.location,
      farmingMethod: produceData.farmingMethod || producerInfo.farmingMethod,
    };

    // Generate AI description
    const description = await generateRichProduceDescription(
      enhancedProduceInfo
    );

    // Create rich embedding text
     const embeddingText = createEmbeddingText(enhancedProduceInfo, description)
     const embedding = await generateEmbedding(embeddingText)

    // Create produce with enhanced data and embedding
    const produce = await prisma.produce.create({
      data: {
        name: produceData.name,
        description,
        descriptionEmbedding: embedding,
        embeddingText: embeddingText,
        price: produceData.price,
        quantity: produceData.quantity,
        category: produceData.category,
        subCategory: produceData.subCategory,
        season: produceData.season,
        farmingMethod: enhancedProduceInfo.farmingMethod,
        location: enhancedProduceInfo.location,
        nutritionalHighlights: produceData.nutritionalHighlights || [],
        commonUses: produceData.commonUses || [],
        preparationTips: produceData.preparationTips,
        storageInstructions: produceData.storageInstructions,
        shelfLife: produceData.shelfLife,
        unit: produceData.unit || "kg",
        producerId: produceData.producerId,
        aiGeneratedDescription: true,
        embeddingModel: "text-embedding-3-small",
      },
      include: {
        producer: {
          select: {
            name: true,
            location: true,
            farmingMethod: true,
          },
        },
      },
    });

    return produce;
  } catch (error) {
    console.error("Error creating enhanced produce with embedding:", error);
    throw error;
  }
}

export async function findSimilarProduce(
  query: string,
  filters?: {
    category?: string;
    season?: string;
    farmingMethod?: string;
    location?: string;
    maxPrice?: number;
  },
  limit = 5
): Promise<any[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Build filter conditions
    const whereConditions: any = {
      isActive: true,
      quantity: { gt: 0 },
      descriptionEmbedding: { not: { equals: [] } },
    };

    if (filters) {
      if (filters.category) {
        whereConditions.category = {
          contains: filters.category,
          mode: "insensitive",
        };
      }
      if (filters.season) {
        whereConditions.OR = [
          { season: { contains: filters.season, mode: "insensitive" } },
          { season: "Year-round" },
        ];
      }
      if (filters.farmingMethod) {
        whereConditions.farmingMethod = {
          contains: filters.farmingMethod,
          mode: "insensitive",
        };
      }
      if (filters.location) {
        whereConditions.location = {
          contains: filters.location,
          mode: "insensitive",
        };
      }
      if (filters.maxPrice) {
        whereConditions.price = { lte: filters.maxPrice };
      }
    }

    // Get filtered produces with embeddings
    const produces = await prisma.produce.findMany({
      where: whereConditions,
      include: {
        producer: {
          select: {
            name: true,
            location: true,
            farmingMethod: true,
          },
        },
      },
    });

    // Calculate cosine similarity
    const producesWithSimilarity = produces.map((produce) => {
      const similarity = cosineSimilarity(
        queryEmbedding,
        produce.descriptionEmbedding
      );
      return {
        ...produce,
        similarity,
      };
    });

    // Sort by similarity and return top results
    return producesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((produce: any) => ({
        id: produce.id,
        name: produce.name,
        description: produce.description,
        price: produce.price,
        quantity: produce.quantity,
        unit: produce.unit,
        category: produce.category,
        subCategory: produce.subCategory,
        season: produce.season,
        farmingMethod: produce.farmingMethod,
        location: produce.location,
        nutritionalHighlights: produce.nutritionalHighlights,
        commonUses: produce.commonUses,
        producer: produce.producer.name,
        producerLocation: produce.producer.location,
        similarity: produce.similarity,
        dateAdded: produce.createdAt.toISOString().split("T")[0],
      }));
  } catch (error) {
    console.error("Error finding similar produce:", error);
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export async function getContextualRecommendations(
  query: string,
  userContext?: {
    location?: string;
    preferences?: string[];
    season?: string;
  }
): Promise<{ recommendations: any[]; explanation: string }> {
  try {
    // Build filters based on user context
    const filters: any = {};

    if (userContext?.location) {
      filters.location = userContext.location;
    }

    if (userContext?.season) {
      filters.season = userContext.season;
    }

    // Find similar produce with context
    const similarProduce = await findSimilarProduce(query, filters, 3);

    // Generate contextual explanation
    const produceList = similarProduce
      .map((p) => {
        const details = [
          `${p.name} - ₱${p.price}/${p.unit}`,
          p.farmingMethod && `${p.farmingMethod}`,
          p.location && `from ${p.location}`,
          p.season && `(${p.season})`,
        ]
          .filter(Boolean)
          .join(" ");
        return details;
      })
      .join("\n");

    const contextInfo = [
      userContext?.location && `User location: ${userContext.location}`,
      userContext?.season && `Current season: ${userContext.season}`,
      userContext?.preferences?.length &&
        `Preferences: ${userContext.preferences.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const explanation = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable farm-to-table assistant. Explain why these produce items match the customer's query, considering location, season, and farming methods.",
        },
        {
          role: "user",
          content: `Customer asked: "${query}"

${contextInfo ? `Context:\n${contextInfo}\n` : ""}
Based on semantic similarity and context, here are the best matches:
${produceList}

Explain in 2-3 sentences why these items are perfect matches, highlighting local sourcing, seasonal availability, and quality factors.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return {
      recommendations: similarProduce,
      explanation:
        explanation.choices[0]?.message?.content ||
        "These items were selected based on their similarity to your query and local availability.",
    };
  } catch (error) {
    console.error("Error getting contextual recommendations:", error);
    return {
      recommendations: [],
      explanation:
        "I'm having trouble finding recommendations right now. Please try again.",
    };
  }
}

export { getContextualRecommendations as getSemanticRecommendations };
