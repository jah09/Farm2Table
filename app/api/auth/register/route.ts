import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Create user
    const user = await createUser(email, password, name, role)

    return NextResponse.json({
      message: "User created successfully",
      user,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
