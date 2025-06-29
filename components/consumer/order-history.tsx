"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  date: string
  status: "pending" | "confirmed" | "delivered"
  total: number
  items: {
    name: string
    quantity: number
    price: number
    producer: string
  }[]
}

export function OrderHistory() {
  const router = useRouter()

  // Mock order data
  const orders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 320,
      items: [
        { name: "Fresh Tomatoes", quantity: 2, price: 120, producer: "Juan Dela Cruz Farm" },
        { name: "Green Lettuce", quantity: 1, price: 80, producer: "Juan Dela Cruz Farm" },
      ],
    },
    {
      id: "ORD-002",
      date: "2024-01-18",
      status: "confirmed",
      total: 190,
      items: [
        { name: "Sweet Carrots", quantity: 1, price: 100, producer: "Maria Santos Farm" },
        { name: "Fresh Spinach", quantity: 1, price: 90, producer: "Pedro Garcia Farm" },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <Package className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/consumer/browse")}
            className="text-green-700 hover:bg-green-50 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-800">Order History</h1>
            <p className="text-green-600 mt-1">Track your previous orders</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">No orders yet</h2>
              <p className="text-green-600 mb-6">Start shopping for fresh produce!</p>
              <Button onClick={() => router.push("/consumer/browse")} className="bg-green-600 hover:bg-green-700">
                Browse Produce
              </Button>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="border-green-200 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-green-800">Order #{order.id}</CardTitle>
                      <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-green-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-green-800">{item.name}</p>
                          <p className="text-sm text-gray-600">by {item.producer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.quantity}kg × ₱{item.price}
                          </p>
                          <p className="font-semibold text-green-800">₱{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-green-200">
                    <span className="font-bold text-green-800">Total</span>
                    <span className="font-bold text-green-800 text-lg">₱{order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
