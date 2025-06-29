import { PrismaClient } from "@prisma/client"
import { findSimilarProduce, generateEmbedding } from "../lib/embeddings"

const prisma = new PrismaClient()

async function debugSearch() {
  console.log("🔍 Debugging search functionality...")

  // 1. Check if we have produce items
  const allProduce = await prisma.produce.findMany({
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

  console.log(`📊 Total produce items: ${allProduce.length}`)

  if (allProduce.length === 0) {
    console.log("❌ No produce items found in database!")
    return
  }

  // 2. Check embeddings
  const produceWithEmbeddings = allProduce.filter(p => 
    p.descriptionEmbedding && p.descriptionEmbedding.length > 0
  )
  const produceWithoutEmbeddings = allProduce.filter(p => 
    !p.descriptionEmbedding || p.descriptionEmbedding.length === 0
  )

  console.log(`✅ Produce with embeddings: ${produceWithEmbeddings.length}`)
  console.log(`❌ Produce without embeddings: ${produceWithoutEmbeddings.length}`)

  // 3. Show sample produce items
  console.log("\n📋 Sample produce items:")
  allProduce.slice(0, 3).forEach((produce, index) => {
    console.log(`${index + 1}. ${produce.name}`)
    console.log(`   Category: ${produce.category}`)
    console.log(`   Farming Method: ${produce.farmingMethod}`)
    console.log(`   Has Embedding: ${produce.descriptionEmbedding && produce.descriptionEmbedding.length > 0 ? 'Yes' : 'No'}`)
    console.log(`   Embedding Length: ${produce.descriptionEmbedding?.length || 0}`)
    console.log(`   Description: ${produce.description?.substring(0, 100)}...`)
    console.log("")
  })

  // 4. Test semantic search directly
  console.log("🔍 Testing semantic search for 'tomatoes'...")
  try {
    const searchResults = await findSimilarProduce("tomatoes", undefined, 10)
    console.log(`Search results: ${searchResults.length} items found`)
    
    if (searchResults.length > 0) {
      console.log("Top results:")
      searchResults.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.name} (similarity: ${result.similarity?.toFixed(3)})`)
      })
    } else {
      console.log("❌ No search results found!")
    }
  } catch (error) {
    console.error("❌ Search error:", error)
  }

  // 5. Test embedding generation
  console.log("\n🧪 Testing embedding generation...")
  try {
    const testEmbedding = await generateEmbedding("tomatoes")
    console.log(`✅ Generated embedding length: ${testEmbedding.length}`)
  } catch (error) {
    console.error("❌ Embedding generation error:", error)
  }
}

async function main() {
  try {
    await debugSearch()
  } catch (error) {
    console.error("Error in debug:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 