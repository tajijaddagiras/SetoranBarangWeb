"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProfileClientProps {
  user: {
    name: string
    email: string
  }
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: ""
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: "Konfirmasi password tidak cocok" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: "Profil berhasil diperbarui." })
        // Reset field password setelah berhasil
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }))
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || "Gagal memperbarui profil" })
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan koneksi" })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "px-2 py-1.5 bg-white border border-gray-400 focus:outline-none focus:border-blue-500 w-full font-medium text-sm text-gray-900"
  const labelClass = "text-left font-medium text-sm text-gray-800"

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="bg-[#000080] p-1.5 px-4 flex justify-between items-center text-white font-bold">
          <span>Pengaturan Profil Admin</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-[#D4D0C8] border border-white flex items-center justify-center text-black text-[10px]">_</div>
            <div className="w-4 h-4 bg-[#D4D0C8] border border-white flex items-center justify-center text-black text-[10px]">X</div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 bg-[#D4D0C8] space-y-6">
          {message && (
            <div className={`p-3 border-2 ${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} font-bold text-sm`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4">
              <label className={labelClass}>Nama Lengkap</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className={inputClass} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4">
              <label className={labelClass}>Email / Username</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className={inputClass} 
              />
            </div>

            <div className="h-px bg-gray-400 my-4"></div>
            <p className="text-xs text-gray-600 italic">* Kosongkan password jika tidak ingin diubah</p>

            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4">
              <label className={labelClass}>Password Baru</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className={inputClass} 
                placeholder="********"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4">
              <label className={labelClass}>Konfirmasi Password</label>
              <input 
                type="password" 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                className={inputClass} 
                placeholder="********"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 text-gray-900 flex items-center gap-2"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Retro Info Box */}
      <div className="border-2 border-gray-400 p-4 bg-blue-50 text-blue-900 text-sm italic">
        <strong>Penting:</strong> Jika Anda mengubah Email atau Password, Anda akan diminta untuk masuk kembali ke sistem demi keamanan data.
      </div>
    </div>
  )
}
