"use client"

import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function Header({ 
  user, 
  onMenuClick 
}: { 
  user: any, 
  onMenuClick?: () => void 
}) {
  const pathname = usePathname()

  const getTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview"
    if (pathname === "/dashboard/nasabah") return "Data Nasabah"
    if (pathname === "/dashboard/pembayaran") return "Input Pembayaran"
    if (pathname === "/dashboard/riwayat") return "Riwayat Setoran"
    if (pathname.includes("/nasabah/tambah")) return "Tambah Nasabah Baru"
    if (pathname.includes("/setoran/")) return "Detail & Riwayat Setoran"
    return "Management System"
  }

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 print:hidden">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">{getTitle()}</h2>
          <p className="text-[10px] md:text-sm text-gray-500 hidden sm:block">Kelola setoran barang dengan mudah dan efisien</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-bold text-gray-800">{user?.name || "User Admin"}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-white border border-gray-200 text-gray-700 p-2 md:px-4 md:py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
