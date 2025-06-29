import type React from "react"
import { CartProvider } from "@/components/consumer/cart-context"
import { ProduceProvider } from "@/components/shared/produce-context"
import { Toaster } from "@/components/ui/toaster"

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProduceProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </ProduceProvider>
  )
}
