"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden relative">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              sizes="64px"
              className="object-contain p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/64x64?text=Logo";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">OESADA UTAMA</h1>
          <p className="text-gray-500 mt-1">Sistem Manajemen Setoran</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 ml-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold active:scale-[0.98]"
          >
            {loading ? "Memproses..." : "Masuk ke Sistem"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          &copy; 2026 PT OESADA UTAMA. All rights reserved.
        </div>
      </div>
    </div>
  )
}
