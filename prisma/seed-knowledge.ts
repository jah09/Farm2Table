import { PrismaClient } from "@prisma/client"
import { createKnowledgeEntry } from "../lib/openai"

const prisma = new PrismaClient()

const knowledgeEntries = [
  {
    title: "Organic Farming Benefits",
    content: "Organic farming produces food without synthetic pesticides, fertilizers, or GMOs. Organic produce often has higher antioxidant levels and fewer pesticide residues. Organic farming also promotes soil health, biodiversity, and environmental sustainability.",
    category: "farming",
    tags: ["organic", "sustainability", "health", "environment"]
  },
  {
    title: "Hydroponic Farming",
    content: "Hydroponic farming grows plants in nutrient-rich water solutions without soil. This method uses less water, produces higher yields, and allows year-round production. Hydroponic produce is often cleaner and more consistent in quality.",
    category: "farming",
    tags: ["hydroponic", "efficiency", "year-round", "clean"]
  },
  {
    title: "Seasonal Eating Benefits",
    content: "Eating seasonal produce ensures maximum freshness, flavor, and nutritional value. Seasonal foods are often more affordable and support local farmers. They also reduce environmental impact from long-distance transportation.",
    category: "nutrition",
    tags: ["seasonal", "freshness", "nutrition", "local", "sustainability"]
  },
  {
    title: "Leafy Greens Nutrition",
    content: "Leafy greens like spinach, kale, and lettuce are rich in vitamins A, C, K, and folate. They provide fiber, antioxidants, and minerals like iron and calcium. Regular consumption supports heart health, vision, and immune function.",
    category: "nutrition",
    tags: ["leafy-greens", "vitamins", "antioxidants", "health"]
  },
  {
    title: "Root Vegetables Cooking",
    content: "Root vegetables like carrots, potatoes, and beets are versatile ingredients. They can be roasted, steamed, mashed, or added to soups and stews. Roasting brings out their natural sweetness, while steaming preserves nutrients.",
    category: "recipes",
    tags: ["root-vegetables", "cooking", "versatile", "roasting"]
  },
  {
    title: "Fresh Produce Storage",
    content: "Store leafy greens in the refrigerator wrapped in damp paper towels. Root vegetables keep best in cool, dark places. Tomatoes should be stored at room temperature until ripe, then refrigerated. Always wash produce before eating.",
    category: "storage",
    tags: ["storage", "freshness", "refrigeration", "washing"]
  },
  {
    title: "Juicing Benefits",
    content: "Fresh vegetable and fruit juices provide concentrated nutrients and antioxidants. Carrots are excellent for juicing due to their natural sweetness and beta-carotene content. Leafy greens add iron and vitamins. Always use fresh, organic produce for juicing.",
    category: "nutrition",
    tags: ["juicing", "nutrients", "antioxidants", "carrots", "greens"]
  },
  {
    title: "Salad Preparation",
    content: "For the best salads, use fresh, crisp greens and a variety of colorful vegetables. Wash all produce thoroughly and dry well. Add protein like nuts or seeds for nutrition. Dress lightly to preserve the natural flavors of the vegetables.",
    category: "recipes",
    tags: ["salads", "preparation", "fresh", "washing", "dressing"]
  },
  {
    title: "Local Farming Benefits",
    content: "Buying from local farmers reduces food miles, supports the local economy, and ensures fresher produce. Local farmers often use sustainable practices and can provide information about their growing methods. You can also visit farms to see how your food is grown.",
    category: "farming",
    tags: ["local", "sustainability", "economy", "freshness", "transparency"]
  },
  {
    title: "Cooking with Fresh Herbs",
    content: "Fresh herbs add flavor and nutrition to dishes without extra calories. Basil pairs well with tomatoes, rosemary with root vegetables, and cilantro with spicy dishes. Add herbs near the end of cooking to preserve their delicate flavors and nutrients.",
    category: "recipes",
    tags: ["herbs", "flavor", "cooking", "nutrition", "basil", "rosemary"]
  },
  {
    title: "Vitamin C Rich Foods",
    content: "Foods high in vitamin C include citrus fruits, bell peppers, tomatoes, and leafy greens. Vitamin C supports immune function, collagen production, and iron absorption. Cooking can reduce vitamin C content, so eat some produce raw when possible.",
    category: "nutrition",
    tags: ["vitamin-c", "immunity", "collagen", "iron", "raw"]
  },
  {
    title: "Sustainable Farming Practices",
    content: "Sustainable farming includes crop rotation, natural pest control, water conservation, and soil health management. These practices protect the environment, maintain soil fertility, and ensure long-term food production. Supporting sustainable farmers helps preserve agricultural land.",
    category: "farming",
    tags: ["sustainable", "crop-rotation", "pest-control", "soil-health", "environment"]
  }
]

async function main() {
  console.log("🌱 Seeding knowledge base with farming and nutrition information...")

  for (const entry of knowledgeEntries) {
    try {
      await createKnowledgeEntry(
        entry.title,
        entry.content,
        entry.category,
        entry.tags
      )
      console.log(`✅ Created knowledge entry: ${entry.title}`)
    } catch (error) {
      console.error(`❌ Failed to create knowledge entry ${entry.title}:`, error)
    }
  }

  console.log("✅ Knowledge base seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 