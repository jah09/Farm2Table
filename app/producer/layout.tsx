import type React from "react"
import { ProduceProvider } from "@/components/shared/produce-context"

export default function ProducerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProduceProvider>{children}</ProduceProvider>
}
