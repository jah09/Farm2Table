import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("💬 Seeding conversation data for analytics...")

  // Get existing users
  const users = await prisma.user.findMany()
  const consumer = users.find(u => u.role === 'CONSUMER')
  
  if (!consumer) {
    console.log("❌ No consumer user found. Please run the main seed first.")
    return
  }

  // Sample conversation data with realistic questions and responses
  const sampleConversations = [
    {
      question: "What vegetables are good for juicing?",
      response: "For juicing, I recommend carrots, spinach, and kale. Carrots provide natural sweetness and beta-carotene, while spinach and kale add iron and vitamins. All are currently available from local organic farms.",
      userId: consumer.id,
      sessionId: "session_juicing_001",
      context: JSON.stringify({
        userPreferences: ["organic", "juicing"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables", "Root Vegetables", "Leafy Greens"],
        responseTime: 1200,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 150
      }),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      question: "I need organic tomatoes for my salad",
      response: "Perfect! I have organic cherry tomatoes available from Dela Cruz Organic Farm in Benguet. They're high in vitamin C and lycopene, perfect for salads. Currently priced at ₱150/kg with 30kg available.",
      userId: consumer.id,
      sessionId: "session_salad_001",
      context: JSON.stringify({
        userPreferences: ["organic", "salads"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables"],
        produceIds: ["tomato_id"],
        responseTime: 800,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 120
      }),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      question: "What's the best lettuce for wraps?",
      response: "For wraps, I recommend the hydroponic butter lettuce from Santos Hydroponic Gardens. It's tender, has large leaves perfect for wrapping, and is available year-round. Currently ₱120/kg with 25kg in stock.",
      userId: consumer.id,
      sessionId: "session_wraps_001",
      context: JSON.stringify({
        userPreferences: ["hydroponic", "wraps"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        produceIds: ["lettuce_id"],
        responseTime: 950,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 140
      }),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    },
    {
      question: "Do you have carrots for roasting?",
      response: "Yes! I have heritage purple carrots from Dela Cruz Organic Farm. They're perfect for roasting - sweet and colorful. Rich in beta-carotene and anthocyanins. Currently ₱180/kg with 20kg available.",
      userId: consumer.id,
      sessionId: "session_roasting_001",
      context: JSON.stringify({
        userPreferences: ["organic", "roasting"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "advanced"
      }),
      metadata: JSON.stringify({
        categories: ["Root Vegetables"],
        produceIds: ["carrot_id"],
        responseTime: 1100,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 160
      }),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      question: "What's good for smoothies?",
      response: "For smoothies, I recommend baby spinach from Santos Hydroponic Gardens. It's pre-washed, tender, and packed with iron and vitamin A. Perfect for green smoothies. Currently ₱140/kg with 15kg available.",
      userId: consumer.id,
      sessionId: "session_smoothies_001",
      context: JSON.stringify({
        userPreferences: ["hydroponic", "smoothies"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        produceIds: ["spinach_id"],
        responseTime: 750,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 130
      }),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      question: "I need organic vegetables for cooking",
      response: "Great choice! I have several organic options perfect for cooking: heritage purple carrots for roasting, organic cherry tomatoes for sauces, and baby spinach for sautéing. All from certified organic farms.",
      userId: consumer.id,
      sessionId: "session_cooking_001",
      context: JSON.stringify({
        userPreferences: ["organic", "cooking"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables", "Root Vegetables", "Leafy Greens"],
        responseTime: 1300,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 180
      }),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      question: "What vegetables are in season now?",
      response: "Currently in season, I have summer vegetables like organic cherry tomatoes, spring baby spinach, and year-round hydroponic butter lettuce. The heritage purple carrots are in their fall season and still available.",
      userId: consumer.id,
      sessionId: "session_seasonal_001",
      context: JSON.stringify({
        userPreferences: ["seasonal", "fresh"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "intermediate"
      }),
      metadata: JSON.stringify({
        categories: ["Vegetables", "Leafy Greens", "Root Vegetables"],
        seasons: ["Summer", "Spring", "Fall"],
        responseTime: 1400,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 200
      }),
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      question: "Do you have hydroponic vegetables?",
      response: "Yes! I have hydroponic butter lettuce and baby spinach from Santos Hydroponic Gardens in Laguna. Hydroponic farming ensures consistent quality and year-round availability. Both are currently in stock.",
      userId: consumer.id,
      sessionId: "session_hydroponic_001",
      context: JSON.stringify({
        userPreferences: ["hydroponic", "consistent"],
        location: "Manila",
        dietaryRestrictions: [],
        cookingSkill: "beginner"
      }),
      metadata: JSON.stringify({
        categories: ["Leafy Greens"],
        farmingMethods: ["Hydroponic"],
        responseTime: 900,
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: 140
      }),
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]

  // Create conversations with varying timestamps to show trends
  for (const conv of sampleConversations) {
    try {
      await prisma.aIConversation.create({
        data: conv
      })
      console.log(`✅ Created conversation: "${conv.question.substring(0, 50)}..."`)
    } catch (error) {
      console.error(`❌ Failed to create conversation:`, error)
    }
  }

  // Create some additional conversations for different users/sessions to show user diversity
  const additionalConversations = [
    {
      question: "What's the best way to store lettuce?",
      response: "For optimal storage, keep lettuce in the refrigerator's crisper drawer. Hydroponic butter lettuce can last 7-10 days when stored properly. Avoid washing until ready to use.",
      sessionId: "session_storage_001",
      context: JSON.stringify({
        userPreferences: ["storage", "freshness"],
        location: "Quezon City",
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
        location: "Makati",
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
    }
  ]

  for (const conv of additionalConversations) {
    try {
      await prisma.aIConversation.create({
        data: conv
      })
      console.log(`✅ Created additional conversation: "${conv.question.substring(0, 50)}..."`)
    } catch (error) {
      console.error(`❌ Failed to create additional conversation:`, error)
    }
  }

  console.log("✅ Conversation data seeded successfully!")
  console.log("📊 Analytics should now show:")
  console.log("   - 10 total conversations")
  console.log("   - Various response times")
  console.log("   - Popular categories: Vegetables, Leafy Greens, Root Vegetables")
  console.log("   - Top questions about juicing, salads, and cooking")
  console.log("   - Daily conversation trends")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 