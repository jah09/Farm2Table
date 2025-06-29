import { ConsumerBrowse } from "@/components/consumer/consumer-browse"
import { ProtectedRoute } from "@/components/shared/protected-route"

export default function ConsumerBrowsePage() {
  return (
    <ProtectedRoute allowedRoles={["CONSUMER"]}>
      <ConsumerBrowse />
    </ProtectedRoute>
  )
}
