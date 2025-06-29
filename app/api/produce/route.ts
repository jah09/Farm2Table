import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";
import { createEnhancedProduceWithEmbedding } from "@/lib/embeddings";

export async function GET() {
  try {
    const produces = await prisma.produce.findMany({
      where: {
        isActive: true,
        quantity: {
          gt: 0,
        },
      },
      include: {
        producer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProduces = produces.map((produce) => ({
      id: produce.id,
      name: produce.name,
      description: produce.description,
      price: produce.price,
      quantity: produce.quantity,
      unit: produce.unit,
      category: produce.category,
      imageUrl: produce.imageUrl,
      producer: produce.producer.name,
      aiGenerated: produce.aiGeneratedDescription,
      dateAdded: produce.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(formattedProduces);
  } catch (error) {
    console.error("Error fetching produce:", error);
    return NextResponse.json(
      { error: "Failed to fetch produce" },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     // const user = await verifyAuth(request);
//     // if (!user || user.role !== "PRODUCER") {
//     //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     // }

//     const { name, price, quantity, category } = await request.json();

//     if (!name || !price || !quantity) {
//       return NextResponse.json(
//         { error: "Name, price, and quantity are required" },
//         { status: 400 }
//       );
//     }

//     // Create produce with AI-generated description and embedding
//     const produce = await createEnhancedProduceWithEmbedding(
//       {
//         name,
//         price: Number.parseFloat(price),
//         quantity: Number.parseInt(quantity),
//         category,
//         producerId: user.id,
//       },
//       "Jah"
//     );

//     return NextResponse.json({
//       id: produce.id,
//       name: produce.name,
//       description: produce.description,
//       price: produce.price,
//       quantity: produce.quantity,
//       unit: produce.unit,
//       category: produce.category,
//       producer: produce.producer.name,
//       aiGenerated: produce.aiGeneratedDescription,
//       dateAdded: produce.createdAt.toISOString().split("T")[0],
//     });
//   } catch (error) {
//     console.error("Error creating produce:", error);
//     return NextResponse.json(
//       { error: "Failed to create produce" },
//       { status: 500 }
//     );
//   }
// }
// ...existing code...
export async function POST(request: NextRequest) {
  try {
    // Remove auth for now, or implement it if needed
    // const user = await verifyAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.quantity) {
      return NextResponse.json(
        { error: "Name, price, and quantity are required" },
        { status: 400 }
      );
    }

    // Use a mock producer for now (replace with real user/producer info in production)
    const producerInfo = {
      name: "Juan Dela Cruz Farm",
      location: body.location || "Benguet, Philippines",
      farmingMethod: body.farmingMethod || "Organic",
    };

    // Call the AI-enhanced creation
    const produce = await createEnhancedProduceWithEmbedding(
      {
        ...body,
        price: Number.parseFloat(body.price),
        quantity: Number.parseInt(body.quantity),
        producerId: body.producerId || "111", 
        unit: body.unit || "kg",
      },
      producerInfo
    );

    return NextResponse.json({
      id: produce.id,
      name: produce.name,
      description: produce.description,
      descriptionEmbedding: produce.descriptionEmbedding, // <-- Add this line
      embeddingText: produce.embeddingText,               // (optional, for debugging)
      price: produce.price,
      quantity: produce.quantity,
      unit: produce.unit,
      category: produce.category,
      producer: produce.producer.name,
      aiGenerated: produce.aiGeneratedDescription,
      dateAdded: produce.createdAt.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error creating produce:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }

    return NextResponse.json(
      { error: "Failed to create produce" },
      { status: 500 }
    );
  }
}
// ...existing code...