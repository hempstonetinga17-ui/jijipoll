"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

const AUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in failed. Please try again.",
  OAuthCreateAccount: "Could not create account with Google.",
  OAuthAccountNotLinked: "This email is already used with a different sign-in method.",
  CredentialsSignin: "Invalid email or password.",
  Default: "Something went wrong. Please try again.",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error")
  const errorMessage = errorCode ? (AUTH_ERRORS[errorCode] ?? AUTH_ERRORS.Default) : null

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setLoginError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setLoginError("Invalid email or password. Please try again.")
    } else {
      router.push("/field-map")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f06135]">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Cancel and go back to landing page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-14 w-auto mb-2" />
          <h2 className="text-3xl font-bold text-white text-center">Login</h2>
          <p className="text-white/60 text-sm mt-1">Sign in to access your field map</p>
        </div>

        {(errorMessage || loginError) && (
          <div className="bg-red-500/20 border border-red-400/50 text-white text-sm rounded-lg px-4 py-3 mb-4 text-center">
            ⚠️ {loginError || errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
              placeholder="company@example.com"
            />
          </div>
          <div>
            <label className="block text-white/80 mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#f06135] font-bold py-3 rounded-lg hover:bg-white/90 transition duration-300 mt-6 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#f06135]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-white/30"></span>
          <span className="text-white/70 text-sm">or</span>
          <span className="h-px w-full bg-white/30"></span>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/field-map" })}
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-100 transition duration-300 mt-4 shadow-lg flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-white/70 text-center mt-6 text-sm">
          Don't have an account? <a href="/register" className="text-white font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f06135]">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
