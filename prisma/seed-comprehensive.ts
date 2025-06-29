import { PrismaClient, UserRole } from "@prisma/client"
import { hashPassword } from "../lib/auth"
import { createEnhancedProduceWithEmbedding } from "../lib/embeddings"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding comprehensive database for MVP...")

  // Create passwords
  const producerPassword = await hashPassword("password123")
  const consumerPassword = await hashPassword("password123")

  // Create multiple producers with different farming methods and locations
  const producers = [
    {
      email: "juan@farm.com",
      name: "Juan Dela Cruz",
      farmName: "Dela Cruz Organic Farm",
      location: "Benguet, Philippines",
      farmingMethod: "Organic",
    },
    {
      email: "maria@farm.com",
      name: "Maria Santos",
      farmName: "Santos Hydroponic Gardens",
      location: "Laguna, Philippines",
      farmingMethod: "Hydroponic",
    },
    {
      email: "pedro@farm.com",
      name: "Pedro Martinez",
      farmName: "Martinez Biodynamic Farm",
      location: "Bukidnon, Philippines",
      farmingMethod: "Biodynamic",
    },
    {
      email: "ana@farm.com",
      name: "Ana Rodriguez",
      farmName: "Rodriguez Family Farm",
      location: "Nueva Ecija, Philippines",
      farmingMethod: "Conventional",
    },
    {
      email: "carlos@farm.com",
      name: "Carlos Lopez",
      farmName: "Lopez Urban Farm",
      location: "Quezon City, Philippines",
      farmingMethod: "Hydroponic",
    }
  ]

  const createdProducers = []
  for (const producer of producers) {
    const created = await prisma.user.upsert({
      where: { email: producer.email },
      update: {},
      create: {
        email: producer.email,
        password: producerPassword,
        name: producer.name,
        role: UserRole.PRODUCER,
        farmName: producer.farmName,
        location: producer.location,
        farmingMethod: producer.farmingMethod,
      },
    })
    createdProducers.push(created)
    console.log(`✅ Created producer: ${producer.name} (${producer.farmingMethod})`)
  }

  // Create multiple consumers with different preferences
  const consumers = [
    {
      email: "sarah@example.com",
      name: "Sarah Johnson",
      location: "Manila, Philippines",
      preferences: ["organic", "juicing", "smoothies"],
      dietaryRestrictions: ["vegetarian"],
      cookingSkill: "beginner"
    },
    {
      email: "mike@example.com",
      name: "Mike Chen",
      location: "Makati, Philippines",
      preferences: ["hydroponic", "cooking", "asian"],
      dietaryRestrictions: [],
      cookingSkill: "advanced"
    },
    {
      email: "lisa@example.com",
      name: "Lisa Garcia",
      location: "Quezon City, Philippines",
      preferences: ["biodynamic", "salads", "mediterranean"],
      dietaryRestrictions: ["gluten-free"],
      cookingSkill: "intermediate"
    },
    {
      email: "david@example.com",
      name: "David Kim",
      location: "Taguig, Philippines",
      preferences: ["local", "seasonal", "roasting"],
      dietaryRestrictions: [],
      cookingSkill: "intermediate"
    },
    {
      email: "emma@example.com",
      name: "Emma Santos",
      location: "Pasig, Philippines",
      preferences: ["organic", "baby food", "steaming"],
      dietaryRestrictions: [],
      cookingSkill: "beginner"
    }
  ]

  const createdConsumers = []
  for (const consumer of consumers) {
    const created = await prisma.user.upsert({
      where: { email: consumer.email },
      update: {},
      create: {
        email: consumer.email,
        password: consumerPassword,
        name: consumer.name,
        role: UserRole.CONSUMER,
      },
    })
    createdConsumers.push(created)
    console.log(`✅ Created consumer: ${consumer.name}`)
  }

  console.log("👤 All users created successfully")

  // Create comprehensive produce data for each producer
  const produceData = [
    // Juan's Organic Farm (Benguet)
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
      producerId: createdProducers[0].id,
      producerInfo: {
        name: createdProducers[0].name,
        location: createdProducers[0].location,
        farmingMethod: createdProducers[0].farmingMethod,
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
      producerId: createdProducers[0].id,
      producerInfo: {
        name: createdProducers[0].name,
        location: createdProducers[0].location,
        farmingMethod: createdProducers[0].farmingMethod,
      },
    },
    {
      name: "Organic Kale",
      price: 120,
      quantity: 25,
      category: "Leafy Greens",
      subCategory: "Kale",
      season: "Winter",
      farmingMethod: "Organic",
      location: "Benguet Highlands",
      nutritionalHighlights: ["Vitamin K", "Iron", "Calcium"],
      commonUses: ["Smoothies", "Salads", "Cooking"],
      preparationTips: "Remove tough stems, massage leaves for salads",
      storageInstructions: "Refrigerate in damp paper towel",
      shelfLife: "5-7 days",
      producerId: createdProducers[0].id,
      producerInfo: {
        name: createdProducers[0].name,
        location: createdProducers[0].location,
        farmingMethod: createdProducers[0].farmingMethod,
      },
    },

    // Maria's Hydroponic Gardens (Laguna)
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
      producerId: createdProducers[1].id,
      producerInfo: {
        name: createdProducers[1].name,
        location: createdProducers[1].location,
        farmingMethod: createdProducers[1].farmingMethod,
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
      producerId: createdProducers[1].id,
      producerInfo: {
        name: createdProducers[1].name,
        location: createdProducers[1].location,
        farmingMethod: createdProducers[1].farmingMethod,
      },
    },
    {
      name: "Hydroponic Bell Peppers",
      price: 200,
      quantity: 18,
      category: "Vegetables",
      subCategory: "Bell",
      season: "Year-round",
      farmingMethod: "Hydroponic",
      location: "Laguna Greenhouse",
      nutritionalHighlights: ["Vitamin C", "Beta-carotene", "Fiber"],
      commonUses: ["Stir-fries", "Salads", "Stuffed"],
      preparationTips: "Wash and remove seeds, slice as needed",
      storageInstructions: "Refrigerate in crisper drawer",
      shelfLife: "7-10 days",
      producerId: createdProducers[1].id,
      producerInfo: {
        name: createdProducers[1].name,
        location: createdProducers[1].location,
        farmingMethod: createdProducers[1].farmingMethod,
      },
    },

    // Pedro's Biodynamic Farm (Bukidnon)
    {
      name: "Biodynamic Strawberries",
      price: 300,
      quantity: 12,
      category: "Fruits",
      subCategory: "Berries",
      season: "Spring",
      farmingMethod: "Biodynamic",
      location: "Bukidnon Highlands",
      nutritionalHighlights: ["Vitamin C", "Antioxidants", "Fiber"],
      commonUses: ["Fresh eating", "Desserts", "Smoothies"],
      preparationTips: "Rinse gently, remove hulls before eating",
      storageInstructions: "Refrigerate immediately, don't wash until ready to eat",
      shelfLife: "3-5 days",
      producerId: createdProducers[2].id,
      producerInfo: {
        name: createdProducers[2].name,
        location: createdProducers[2].location,
        farmingMethod: createdProducers[2].farmingMethod,
      },
    },
    {
      name: "Biodynamic Sweet Potatoes",
      price: 160,
      quantity: 35,
      category: "Root Vegetables",
      subCategory: "Sweet Potato",
      season: "Fall",
      farmingMethod: "Biodynamic",
      location: "Bukidnon Farmlands",
      nutritionalHighlights: ["Beta-carotene", "Fiber", "Vitamin C"],
      commonUses: ["Roasting", "Mashing", "Fries"],
      preparationTips: "Scrub well, can be cooked with skin on",
      storageInstructions: "Store in cool, dark place",
      shelfLife: "2-3 weeks",
      producerId: createdProducers[2].id,
      producerInfo: {
        name: createdProducers[2].name,
        location: createdProducers[2].location,
        farmingMethod: createdProducers[2].farmingMethod,
      },
    },

    // Ana's Conventional Farm (Nueva Ecija)
    {
      name: "Fresh White Onions",
      price: 80,
      quantity: 50,
      category: "Vegetables",
      subCategory: "Onion",
      season: "Year-round",
      farmingMethod: "Conventional",
      location: "Nueva Ecija Plains",
      nutritionalHighlights: ["Vitamin C", "Fiber", "Antioxidants"],
      commonUses: ["Cooking", "Salads", "Sauces"],
      preparationTips: "Peel outer layer, chop as needed",
      storageInstructions: "Store in cool, dry place",
      shelfLife: "2-3 weeks",
      producerId: createdProducers[3].id,
      producerInfo: {
        name: createdProducers[3].name,
        location: createdProducers[3].location,
        farmingMethod: createdProducers[3].farmingMethod,
      },
    },
    {
      name: "Garlic Bulbs",
      price: 100,
      quantity: 40,
      category: "Vegetables",
      subCategory: "Garlic",
      season: "Year-round",
      farmingMethod: "Conventional",
      location: "Nueva Ecija Plains",
      nutritionalHighlights: ["Allicin", "Vitamin C", "Antibacterial"],
      commonUses: ["Cooking", "Seasoning", "Health"],
      preparationTips: "Peel cloves, mince or crush as needed",
      storageInstructions: "Store in cool, dry place",
      shelfLife: "3-4 weeks",
      producerId: createdProducers[3].id,
      producerInfo: {
        name: createdProducers[3].name,
        location: createdProducers[3].location,
        farmingMethod: createdProducers[3].farmingMethod,
      },
    },

    // Carlos's Urban Farm (Quezon City)
    {
      name: "Urban Microgreens Mix",
      price: 250,
      quantity: 8,
      category: "Microgreens",
      subCategory: "Mixed",
      season: "Year-round",
      farmingMethod: "Hydroponic",
      location: "Quezon City Urban Farm",
      nutritionalHighlights: ["Concentrated nutrients", "Vitamins", "Minerals"],
      commonUses: ["Garnishes", "Salads", "Smoothies"],
      preparationTips: "Ready to eat, no washing needed",
      storageInstructions: "Refrigerate in original container",
      shelfLife: "5-7 days",
      producerId: createdProducers[4].id,
      producerInfo: {
        name: createdProducers[4].name,
        location: createdProducers[4].location,
        farmingMethod: createdProducers[4].farmingMethod,
      },
    },
    {
      name: "Urban Basil",
      price: 180,
      quantity: 10,
      category: "Herbs",
      subCategory: "Basil",
      season: "Year-round",
      farmingMethod: "Hydroponic",
      location: "Quezon City Urban Farm",
      nutritionalHighlights: ["Vitamin K", "Antioxidants", "Essential oils"],
      commonUses: ["Pesto", "Garnishes", "Cooking"],
      preparationTips: "Rinse gently, remove stems if needed",
      storageInstructions: "Refrigerate in damp paper towel",
      shelfLife: "5-7 days",
      producerId: createdProducers[4].id,
      producerInfo: {
        name: createdProducers[4].name,
        location: createdProducers[4].location,
        farmingMethod: createdProducers[4].farmingMethod,
      },
    }
  ]

  console.log("🤖 Generating enhanced AI descriptions and embeddings for all produce...")

  for (const item of produceData) {
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
      console.log(`✅ Created ${item.name} from ${item.producerInfo.name}`)
    } catch (error) {
      console.error(`❌ Failed to create ${item.name}:`, error)
    }
  }

  console.log("✅ All produce created successfully!")

  // Create comprehensive conversation data with realistic user interactions
  const conversationData = [
    // Sarah's conversations (organic, juicing, vegetarian)
    {
      question: "What vegetables are good for juicing?",
      response: "For juicing, I recommend carrots, spinach, and kale. Carrots provide natural sweetness and beta-carotene, while spinach and kale add iron and vitamins. All are currently available from local organic farms.",
      userId: createdConsumers[0].id,
      sessionId: "session_sarah_juicing_001",
      context: JSON.stringify({
        userPreferences: ["organic", "juicing"],
        location: "Manila, Philippines",
        dietaryRestrictions: ["vegetarian"],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables", "Root Vegetables", "Leafy Greens"],
        responseTime: 1200,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 150
      }),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      question: "I need organic vegetables for smoothies",
      response: "Perfect for smoothies! I recommend organic kale and baby spinach. Both are packed with nutrients and work great in green smoothies. The kale is from Dela Cruz Organic Farm and spinach from Santos Hydroponic Gardens.",
      userId: createdConsumers[0].id,
      sessionId: "session_sarah_smoothies_001",
      context: JSON.stringify({
        userPreferences: ["organic", "smoothies"],
        location: "Manila, Philippines",
        dietaryRestrictions: ["vegetarian"],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        responseTime: 950,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 140
      }),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },

    // Mike's conversations (hydroponic, cooking, advanced)
    {
      question: "What's the best lettuce for Asian cooking?",
      response: "For Asian cooking, I recommend the hydroponic butter lettuce from Santos Hydroponic Gardens. It's tender, has large leaves perfect for wraps and stir-fries, and maintains crispness when cooked briefly.",
      userId: createdConsumers[1].id,
      sessionId: "session_mike_asian_001",
      context: JSON.stringify({
        userPreferences: ["hydroponic", "cooking", "asian"],
        location: "Makati, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "advanced"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        responseTime: 1100,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 160
      }),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    {
      question: "Do you have bell peppers for stir-fries?",
      response: "Yes! I have hydroponic bell peppers from Santos Hydroponic Gardens. They're perfect for stir-fries - sweet, crisp, and available year-round. Currently ₱200/kg with 18kg in stock.",
      userId: createdConsumers[1].id,
      sessionId: "session_mike_stirfry_001",
      context: JSON.stringify({
        userPreferences: ["hydroponic", "cooking", "asian"],
        location: "Makati, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "advanced"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables"],
        responseTime: 850,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 130
      }),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },

    // Lisa's conversations (biodynamic, salads, gluten-free)
    {
      question: "What vegetables are good for Mediterranean salads?",
      response: "For Mediterranean salads, I recommend biodynamic strawberries and organic cherry tomatoes. The strawberries add sweetness and antioxidants, while tomatoes provide acidity and lycopene. Both are perfect for gluten-free diets.",
      userId: createdConsumers[2].id,
      sessionId: "session_lisa_mediterranean_001",
      context: JSON.stringify({
        userPreferences: ["biodynamic", "salads", "mediterranean"],
        location: "Quezon City, Philippines",
        dietaryRestrictions: ["gluten-free"],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Fruits", "Vegetables"],
        responseTime: 1300,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 180
      }),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    },
    {
      question: "Are your biodynamic vegetables certified?",
      response: "Yes! Our biodynamic vegetables from Martinez Biodynamic Farm in Bukidnon are certified biodynamic. This means they're grown following strict organic and biodynamic principles, including lunar cycles and natural preparations.",
      userId: createdConsumers[2].id,
      sessionId: "session_lisa_certification_001",
      context: JSON.stringify({
        userPreferences: ["biodynamic", "certified"],
        location: "Quezon City, Philippines",
        dietaryRestrictions: ["gluten-free"],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Fruits", "Root Vegetables"],
        responseTime: 1400,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 200
      }),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },

    // David's conversations (local, seasonal, roasting)
    {
      question: "What's good for roasting this season?",
      response: "For roasting this season, I recommend heritage purple carrots from Dela Cruz Organic Farm and biodynamic sweet potatoes from Martinez Farm. Both are perfect for roasting - sweet and nutritious.",
      userId: createdConsumers[3].id,
      sessionId: "session_david_roasting_001",
      context: JSON.stringify({
        userPreferences: ["local", "seasonal", "roasting"],
        location: "Taguig, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Root Vegetables"],
        responseTime: 1000,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 150
      }),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      question: "Do you have local onions and garlic?",
      response: "Yes! I have fresh white onions and garlic bulbs from Rodriguez Family Farm in Nueva Ecija. They're locally grown and perfect for cooking. Onions are ₱80/kg and garlic ₱100/kg.",
      userId: createdConsumers[3].id,
      sessionId: "session_david_local_001",
      context: JSON.stringify({
        userPreferences: ["local", "seasonal"],
        location: "Taguig, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables"],
        responseTime: 750,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 120
      }),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },

    // Emma's conversations (organic, baby food, beginner)
    {
      question: "What vegetables are good for baby food?",
      response: "For baby food, I recommend organic sweet potatoes and carrots. They're naturally sweet, easy to puree, and packed with nutrients. Both are organic and perfect for introducing solids to babies.",
      userId: createdConsumers[4].id,
      sessionId: "session_emma_baby_001",
      context: JSON.stringify({
        userPreferences: ["organic", "baby food"],
        location: "Pasig, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Root Vegetables"],
        responseTime: 1150,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 160
      }),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      question: "How do I steam vegetables properly?",
      response: "For steaming, I recommend baby spinach and microgreens. Use a steamer basket over boiling water for 2-3 minutes. The baby spinach from Santos Gardens and microgreens from Lopez Urban Farm are perfect for steaming.",
      userId: createdConsumers[4].id,
      sessionId: "session_emma_steaming_001",
      context: JSON.stringify({
        userPreferences: ["organic", "steaming"],
        location: "Pasig, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens", "Microgreens"],
        responseTime: 1250,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 170
      }),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    },

    // Additional conversations for different scenarios
    {
      question: "What's the best way to store lettuce?",
      response: "For optimal storage, keep lettuce in the refrigerator's crisper drawer. Hydroponic butter lettuce can last 7-10 days when stored properly. Avoid washing until ready to use.",
      sessionId: "session_storage_001",
      context: JSON.stringify({
        userPreferences: ["storage", "freshness"],
        location: "Quezon City, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        responseTime: 650,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 110
      }),
      createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      question: "Are your vegetables pesticide-free?",
      response: "Yes! Our organic vegetables from Dela Cruz Organic Farm are certified pesticide-free. The hydroponic vegetables from Santos Gardens are also grown without pesticides in controlled environments.",
      sessionId: "session_organic_001",
      context: JSON.stringify({
        userPreferences: ["pesticide-free", "organic"],
        location: "Makati, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables", "Leafy Greens"],
        farmingMethods: ["Organic", "Hydroponic"],
        responseTime: 1100,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 160
      }),
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      question: "What herbs do you have for cooking?",
      response: "I have fresh basil from Lopez Urban Farm in Quezon City. It's hydroponically grown and perfect for pesto, garnishes, and cooking. Currently ₱180/kg with 10kg available.",
      sessionId: "session_herbs_001",
      context: JSON.stringify({
        userPreferences: ["herbs", "cooking"],
        location: "Manila, Philippines",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Herbs"],
        responseTime: 800,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 130
      }),
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]

  console.log("💬 Creating comprehensive conversation data...")

  for (const conv of conversationData) {
    try {
      await prisma.aIConversation.create({
        data: conv
      })
      console.log(`✅ Created conversation: "${conv.question.substring(0, 50)}..."`)
    } catch (error) {
      console.error(`❌ Failed to create conversation:`, error)
    }
  }

  console.log("✅ Comprehensive database seeding completed!")
  console.log("📊 MVP Data Summary:")
  console.log("   👥 Users: 5 producers + 5 consumers")
  console.log("   🥬 Produce: 12 items across 5 farms")
  console.log("   💬 Conversations: 12 realistic interactions")
  console.log("   🏭 Farming Methods: Organic, Hydroponic, Biodynamic, Conventional")
  console.log("   📍 Locations: Benguet, Laguna, Bukidnon, Nueva Ecija, Quezon City")
  console.log("   🍽️ Use Cases: Juicing, Cooking, Salads, Baby Food, Asian Cuisine")
  console.log("")
  console.log("🔑 Sample Login Credentials:")
  console.log("   Producers:")
  console.log("     juan@farm.com / password123 (Organic - Benguet)")
  console.log("     maria@farm.com / password123 (Hydroponic - Laguna)")
  console.log("     pedro@farm.com / password123 (Biodynamic - Bukidnon)")
  console.log("     ana@farm.com / password123 (Conventional - Nueva Ecija)")
  console.log("     carlos@farm.com / password123 (Urban Hydroponic - QC)")
  console.log("   Consumers:")
  console.log("     sarah@example.com / password123 (Organic, Juicing)")
  console.log("     mike@example.com / password123 (Hydroponic, Asian Cooking)")
  console.log("     lisa@example.com / password123 (Biodynamic, Mediterranean)")
  console.log("     david@example.com / password123 (Local, Seasonal)")
  console.log("     emma@example.com / password123 (Organic, Baby Food)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 