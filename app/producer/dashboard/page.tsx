import { ProducerDashboard } from "@/components/producer/producer-dashboard"
import { ProtectedRoute } from "@/components/shared/protected-route"

export default function ProducerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["PRODUCER"]}>
      <ProducerDashboard />
    </ProtectedRoute>
  )
}
