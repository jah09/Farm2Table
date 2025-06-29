import { PrismaClient, UserRole } from "@prisma/client"
import { hashPassword } from "../lib/auth"
import { createEnhancedProduceWithEmbedding } from "../lib/embeddings"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database with enhanced produce data...")

  // Create sample users with enhanced profiles
  const producerPassword = await hashPassword("password123")
  const consumerPassword = await hashPassword("password123")

  const producer1 = await prisma.user.upsert({
    where: { email: "juan@farm.com" },
    update: {},
    create: {
      email: "juan@farm.com",
      password: producerPassword,
      name: "Juan Dela Cruz",
      role: UserRole.PRODUCER,
      farmName: "Dela Cruz Organic Farm",
      location: "Benguet, Philippines",
      farmingMethod: "Organic",
    },
  })

  const producer2 = await prisma.user.upsert({
    where: { email: "maria@farm.com" },
    update: {},
    create: {
      email: "maria@farm.com",
      password: producerPassword,
      name: "Maria Santos",
      role: UserRole.PRODUCER,
      farmName: "Santos Hydroponic Gardens",
      location: "Laguna, Philippines",
      farmingMethod: "Hydroponic",
    },
  })

  const consumer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: consumerPassword,
      name: "Sample Customer",
      role: UserRole.CONSUMER,
    },
  })

  console.log("👤 Enhanced user profiles created")

  // Create enhanced produce with rich context
  const enhancedProduceItems = [
    {
      name: "Organic Cherry Tomatoes",
      price: 150,
      quantity: 30,
      category: "Vegetables",
      subCategory: "Cherry",
      season: "Summer",
      farmingMethod: "Organic",
      location: "Benguet Highlands",
      nutritionalHighlights: ["High in Vitamin C", "Rich in Lycopene", "Antioxidants"],
      commonUses: ["Salads", "Cooking", "Fresh eating"],
      preparationTips: "Wash gently before use, store at room temperature for best flavor",
      storageInstructions: "Room temperature for 2-3 days, then refrigerate",
      shelfLife: "5-7 days",
      producerId: producer1.id,
      producerInfo: {
        name: producer1.name,
        location: producer1.location,
        farmingMethod: producer1.farmingMethod,
      },
    },
    {
      name: "Hydroponic Butter Lettuce",
      price: 120,
      quantity: 25,
      category: "Leafy Greens",
      subCategory: "Butter",
      season: "Year-round",
      farmingMethod: "Hydroponic",
      location: "Laguna Controlled Environment",
      nutritionalHighlights: ["High in Folate", "Vitamin K", "Low calories"],
      commonUses: ["Salads", "Wraps", "Sandwiches"],
      preparationTips: "Rinse gently with cold water, pat dry with paper towels",
      storageInstructions: "Refrigerate in crisper drawer",
      shelfLife: "7-10 days",
      producerId: producer2.id,
      producerInfo: {
        name: producer2.name,
        location: producer2.location,
        farmingMethod: producer2.farmingMethod,
      },
    },
    {
      name: "Heritage Purple Carrots",
      price: 180,
      quantity: 20,
      category: "Root Vegetables",
      subCategory: "Heritage",
      season: "Fall",
      farmingMethod: "Organic",
      location: "Benguet Mountain Farms",
      nutritionalHighlights: ["Beta-carotene", "Anthocyanins", "Fiber"],
      commonUses: ["Roasting", "Juicing", "Raw snacking"],
      preparationTips: "Scrub well, peeling optional for organic varieties",
      storageInstructions: "Refrigerate in plastic bag",
      shelfLife: "2-3 weeks",
      producerId: producer1.id,
      producerInfo: {
        name: producer1.name,
        location: producer1.location,
        farmingMethod: producer1.farmingMethod,
      },
    },
    {
      name: "Baby Spinach",
      price: 140,
      quantity: 15,
      category: "Leafy Greens",
      subCategory: "Baby",
      season: "Spring",
      farmingMethod: "Hydroponic",
      location: "Laguna Greenhouse",
      nutritionalHighlights: ["Iron", "Vitamin A", "Folate"],
      commonUses: ["Smoothies", "Salads", "Sautéing"],
      preparationTips: "Pre-washed, ready to eat, gentle handling required",
      storageInstructions: "Refrigerate immediately",
      shelfLife: "3-5 days",
      producerId: producer2.id,
      producerInfo: {
        name: producer2.name,
        location: producer2.location,
        farmingMethod: producer2.farmingMethod,
      },
    },
  ]

  console.log("🤖 Generating enhanced AI descriptions and embeddings...")

  for (const item of enhancedProduceItems) {
    try {
      await createEnhancedProduceWithEmbedding(
        {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          subCategory: item.subCategory,
          season: item.season,
          farmingMethod: item.farmingMethod,
          location: item.location,
          nutritionalHighlights: item.nutritionalHighlights,
          commonUses: item.commonUses,
          preparationTips: item.preparationTips,
          storageInstructions: item.storageInstructions,
          shelfLife: item.shelfLife,
          producerId: item.producerId,
        },
        item.producerInfo,
      )
      console.log(`✅ Created ${item.name} with enhanced AI description and embedding`)
    } catch (error) {
      console.error(`❌ Failed to create ${item.name}:`, error)
    }
  }

  console.log("✅ Database seeded with enhanced produce data!")
  console.log("👤 Sample accounts:")
  console.log("   Producer: juan@farm.com / password123 (Organic Farm in Benguet)")
  console.log("   Producer: maria@farm.com / password123 (Hydroponic Farm in Laguna)")
  console.log("   Consumer: customer@example.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
