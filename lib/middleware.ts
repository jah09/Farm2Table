import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import type { AuthUser } from "./auth"

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || "",
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}
