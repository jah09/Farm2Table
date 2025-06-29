"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string
  role: "PRODUCER" | "CONSUMER"
  farmName?: string
  location?: string
  farmingMethod?: string
  createdAt: string
  updatedAt: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: "PRODUCER" | "CONSUMER"
  farmName?: string
  location?: string
  farmingMethod?: string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Redirect based on user role when user changes
  useEffect(() => {
    if (user && !isLoading) {
      // Only redirect if we're not already on the correct page
      const currentPath = window.location.pathname
      if (user.role === "PRODUCER" && !currentPath.startsWith("/producer")) {
        router.push("/producer/dashboard")
      } else if (user.role === "CONSUMER" && !currentPath.startsWith("/consumer")) {
        router.push("/consumer/browse")
      }
    }
  }, [user, isLoading, router])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        toast.success(`Welcome back, ${data.user.name}!`)
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || "Login failed")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please try again.")
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        toast.success(`Welcome to Farm2Table, ${data.user.name}!`)
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || "Registration failed")
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
      return false
    }
  }

  const logout = async () => {
    try {
      // First clear the user state to prevent automatic redirects
      setUser(null)
      
      // Then call the logout API
      await fetch("/api/auth/logout", { method: "POST" })
      
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed")
      // If logout fails, we should re-check auth status
      await checkAuthStatus()
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      const response = await fetch(`/api/auth/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        toast.success("Profile updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Update failed")
      }
    } catch (error) {
      console.error("Update user error:", error)
      toast.error("Update failed. Please try again.")
    }
  }

  const value: UserContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 