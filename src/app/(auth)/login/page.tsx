"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import dynamic from "next/dynamic"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f06135]">
      {/* Live map background */}
      <div className="absolute inset-0 z-0 mix-blend-luminosity">
        <LandingMap />
      </div>

      {/* Orange overlay for legibility */}
      <div className="absolute inset-0 z-[1] bg-[#f06135]/60" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 sm:mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl shadow-2xl p-8 sm:p-10">

          {/* Close button */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-14 w-auto mb-3" style={{ filter: "brightness(0)", mixBlendMode: "multiply" }} />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-white/60 text-sm mt-1 text-center">Sign in to access your field intelligence dashboard</p>
          </div>

          {/* Google sign-in button */}
          <button
            id="google-signin-btn"
            onClick={() => signIn("google", { callbackUrl: "/field-map" })}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 shadow-xl text-sm sm:text-base"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-white/50 text-xs text-center mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline text-white/70 hover:text-white">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy-policy" className="underline text-white/70 hover:text-white">Privacy Policy</a>.
          </p>

          <div className="mt-6 pt-5 border-t border-white/15 text-center">
            <p className="text-white/60 text-sm">
              New to Jijipoll?{" "}
              <button
                onClick={() => signIn("google", { callbackUrl: "/field-map" })}
                className="text-white font-bold hover:underline"
              >
                Sign up free
              </button>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
          {["🔒 Secure", "✅ Verified", "🌍 45+ Counties"].map(badge => (
            <span key={badge} className="text-white/70 text-xs font-medium bg-white/10 px-3 py-1 rounded-full border border-white/15">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f06135]">
        <div className="text-white text-xl font-semibold animate-pulse">Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
