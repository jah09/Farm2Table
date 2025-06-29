"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  producer: string
  maxQuantity: number
  unit: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("farm2table-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart)
          console.log("Cart loaded from localStorage:", parsedCart)
        } else {
          console.warn("Invalid cart data in localStorage, resetting")
          setCart([])
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      setCart([])
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("farm2table-cart", JSON.stringify(cart))
        console.log("Cart saved to localStorage:", cart)
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [cart, isInitialized])

  const addToCart = useCallback((item: CartItem) => {
    console.log("Adding item to cart:", item)
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        const updatedCart = prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + item.quantity, cartItem.maxQuantity) }
            : cartItem,
        )
        console.log("Updated existing item in cart:", updatedCart)
        return updatedCart
      }
      const newCart = [...prevCart, item]
      console.log("Added new item to cart:", newCart)
      return newCart
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    console.log("Removing item from cart:", id)
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== id)
      console.log("Item removed from cart:", newCart)
      return newCart
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    console.log("Updating quantity for item:", id, "to:", quantity)
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => 
        item.id === id 
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) } 
          : item
      )
      console.log("Quantity updated in cart:", updatedCart)
      return updatedCart
    })
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    console.log("Clearing cart")
    setCart([])
  }, [])

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
