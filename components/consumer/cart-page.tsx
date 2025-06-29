"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/consumer/cart-context"
import { Logo } from "@/components/shared/logo"

export function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCheckingOut(true)

    // Mock checkout process
    setTimeout(() => {
      setOrderPlaced(true)
      setIsCheckingOut(false)
      clearCart()
    }, 2000)
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Order Placed Successfully!</CardTitle>
            <CardDescription>Your order has been sent to the producers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 text-center">
                The producers will contact you within 24 hours to arrange delivery or pickup.
              </p>
            </div>
            <Button onClick={() => router.push("/consumer/browse")} className="w-full bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/consumer/browse")}
              className="text-green-700 hover:bg-green-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </div>

          <div className="text-center py-16">
            <Logo size="lg" className="justify-center mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Your cart is empty</h2>
            <p className="text-green-600 mb-6">Add some fresh produce to get started!</p>
            <Button onClick={() => router.push("/consumer/browse")} className="bg-green-600 hover:bg-green-700">
              Browse Produce
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalPrice = getTotalPrice()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/consumer/browse")}
              className="text-green-700 hover:bg-green-50 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
            <Logo size="sm" showText={false} className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Shopping Cart</h1>
              <p className="text-green-600 mt-1">{cart.length} items in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-green-800 text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">by {item.producer}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-semibold text-green-800 min-w-[3rem] text-center">{item.quantity}kg</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">₱{item.price}/kg</p>
                      <p className="font-bold text-green-800">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <Card className="border-green-200 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-green-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} ({item.quantity}kg)
                      </span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg text-green-800 mb-6">
                  <span>Total</span>
                  <span>₱{totalPrice.toFixed(2)}</span>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="09XX XXX XXXX"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Your complete address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions..."
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      className="border-green-200 focus:border-green-400"
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isCheckingOut}>
                    {isCheckingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700">
                    Orders are sent directly to producers. They will contact you to arrange payment and delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
