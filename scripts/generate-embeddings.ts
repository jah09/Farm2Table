import { PrismaClient } from "@prisma/client"
import { generateEmbedding, createEmbeddingText, generateRichProduceDescription } from "../lib/embeddings"

const prisma = new PrismaClient()

async function generateEmbeddingsForExistingProduce() {
  console.log("🔍 Finding produce items without embeddings...")

  // Find all produce items that don't have embeddings
  const produceWithoutEmbeddings = await prisma.produce.findMany({
    where: {
      OR: [
        { descriptionEmbedding: { equals: [] } },
        { descriptionEmbedding: { equals: null } },
      ],
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
  })

  console.log(`Found ${produceWithoutEmbeddings.length} produce items without embeddings`)

  if (produceWithoutEmbeddings.length === 0) {
    console.log("✅ All produce items already have embeddings!")
    return
  }

  console.log("🤖 Generating embeddings for existing produce items...")

  for (const produce of produceWithoutEmbeddings) {
    try {
      console.log(`Processing: ${produce.name}`)

      // Generate AI description if not exists
      let description = produce.description || ""
      if (!description || description.length < 50) {
        const enhancedProduceInfo = {
          name: produce.name,
          description: produce.description || undefined,
          category: produce.category || undefined,
          subCategory: produce.subCategory || undefined,
          season: produce.season || undefined,
          farmingMethod: produce.farmingMethod || produce.producer.farmingMethod || undefined,
          location: produce.location || produce.producer.location || undefined,
          price: produce.price,
          quantity: produce.quantity,
          unit: produce.unit,
          producer: produce.producer.name,
          nutritionalHighlights: produce.nutritionalHighlights || [],
          commonUses: produce.commonUses || [],
          preparationTips: produce.preparationTips || undefined,
          storageInstructions: produce.storageInstructions || undefined,
          shelfLife: produce.shelfLife || undefined,
        }

        description = await generateRichProduceDescription(enhancedProduceInfo)
      }

      // Create embedding text
      const embeddingText = createEmbeddingText(
        {
          name: produce.name,
          description: description || undefined,
          category: produce.category || undefined,
          subCategory: produce.subCategory || undefined,
          season: produce.season || undefined,
          farmingMethod: produce.farmingMethod || produce.producer.farmingMethod || undefined,
          location: produce.location || produce.producer.location || undefined,
          price: produce.price,
          quantity: produce.quantity,
          unit: produce.unit,
          producer: produce.producer.name,
          nutritionalHighlights: produce.nutritionalHighlights || [],
          commonUses: produce.commonUses || [],
          preparationTips: produce.preparationTips || undefined,
          storageInstructions: produce.storageInstructions || undefined,
          shelfLife: produce.shelfLife || undefined,
        },
        description
      )

      // Generate embedding
      const embedding = await generateEmbedding(embeddingText)

      // Update the produce item
      await prisma.produce.update({
        where: { id: produce.id },
        data: {
          description: description,
          descriptionEmbedding: embedding,
          embeddingText: embeddingText,
          aiGeneratedDescription: !produce.description || produce.description.length < 50,
          embeddingModel: "text-embedding-3-small",
        },
      })

      console.log(`✅ Generated embedding for: ${produce.name}`)
    } catch (error) {
      console.error(`❌ Failed to generate embedding for ${produce.name}:`, error)
    }
  }

  console.log("✅ Finished generating embeddings for existing produce items!")
}

async function main() {
  try {
    await generateEmbeddingsForExistingProduce()
  } catch (error) {
    console.error("Error generating embeddings:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 