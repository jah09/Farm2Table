import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/shared/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="text-green-600">Fresh produce, direct from farm</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
