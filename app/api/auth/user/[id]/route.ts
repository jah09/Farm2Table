import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Only allow users to update their own profile
    if (user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, farmName, location, farmingMethod } = body

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        farmName: farmName || undefined,
        location: location || undefined,
        farmingMethod: farmingMethod || undefined,
      },
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        farmName: updatedUser.farmName,
        location: updatedUser.location,
        farmingMethod: updatedUser.farmingMethod,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 