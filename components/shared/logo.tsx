interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Background Circle */}
          <circle cx="24" cy="24" r="24" fill="#16a34a" className="opacity-10" />

          {/* Farm House */}
          <path
            d="M12 28L18 22L24 16L30 22L36 28V36C36 37.1 35.1 38 34 38H14C12.9 38 12 37.1 12 36V28Z"
            fill="#16a34a"
            className="opacity-80"
          />

          {/* Roof */}
          <path d="M10 28L24 14L38 28L36 30L24 18L12 30L10 28Z" fill="#15803d" />

          {/* Door */}
          <rect x="21" y="32" width="6" height="6" rx="1" fill="#ffffff" />

          {/* Windows */}
          <rect x="15" y="26" width="4" height="4" rx="0.5" fill="#ffffff" />
          <rect x="29" y="26" width="4" height="4" rx="0.5" fill="#ffffff" />

          {/* Leaves/Produce around the house */}
          <circle cx="8" cy="20" r="2" fill="#22c55e" />
          <circle cx="40" cy="20" r="2" fill="#22c55e" />
          <circle cx="6" cy="32" r="1.5" fill="#ef4444" />
          <circle cx="42" cy="32" r="1.5" fill="#f97316" />

          {/* Table element at bottom */}
          <rect x="16" y="40" width="16" height="2" rx="1" fill="#16a34a" />
          <rect x="18" y="38" width="2" height="4" fill="#16a34a" />
          <rect x="28" y="38" width="2" height="4" fill="#16a34a" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-green-800 ${currentSize.text}`}>
            Farm<span className="text-green-600">2</span>Table
          </span>
          {size === "lg" && (
            <span className="text-xs text-green-600 font-medium tracking-wide">FRESH • LOCAL • DIRECT</span>
          )}
        </div>
      )}
    </div>
  )
}

// Alternative minimalist logo version
export function LogoMinimal({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: 20,
    md: 28,
    lg: 40,
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={sizes[size]} height={sizes[size]} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf shape */}
        <path
          d="M16 4C20 4 28 8 28 16C28 20 24 24 20 26C18 27 16 28 16 28C16 28 14 27 12 26C8 24 4 20 4 16C4 8 12 4 16 4Z"
          fill="#16a34a"
        />

        {/* Leaf vein */}
        <path d="M16 6C16 6 16 12 16 20C16 24 16 26 16 26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Side veins */}
        <path d="M16 12C18 10 22 10 24 12" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        <path d="M16 12C14 10 10 10 8 12" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}
