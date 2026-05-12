"use client"
import Link from "next/link"

type Stats = {
  totalNasabah: number
  setoranAktif: number
  keuntunganBulanIni: number
  nasabahSetorBulanIni: number
  financial: {
    totalInvestasi: number
    totalPiutang: number
    totalDiterima: number
    sisaPiutang: number
  }
  recentTransactions: any[]
  upcomingPayments: any[]
}

export default function DashboardClient({ stats }: { stats: Stats }) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="p-4 font-sans text-sm space-y-6">
      {/* ===== TOP STATISTICS BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Nasabah", val: stats.totalNasabah, color: "text-blue-700", icon: "👥" },
          { label: "Setoran Aktif", val: stats.setoranAktif, color: "text-green-700", icon: "✅" },
          { label: "Setor Bulan Ini", val: stats.nasabahSetorBulanIni, color: "text-purple-700", icon: "📅" },
          { label: "Target Profit", val: formatRupiah(stats.keuntunganBulanIni), color: "text-orange-700", icon: "📈" },
        ].map((item, i) => (
          <div key={i} className="border-2 border-gray-400 bg-[#D4D0C8] shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            <div className="bg-[#000080] p-1 px-3 text-white font-bold flex justify-between items-center text-xs">
              <span>{item.label}</span>
              <span>{item.icon}</span>
            </div>
            <div className="p-4 bg-white text-center">
              <span className={`text-2xl font-bold ${item.color}`}>{item.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== FINANCIAL SUMMARY ===== */}
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        <div className="bg-[#000080] p-1.5 px-4 text-white font-bold flex justify-between items-center">
          <span>Ringkasan Keuangan Keseluruhan</span>
          <span className="text-xs italic opacity-80">Real-time Data</span>
        </div>
        <div className="p-4 sm:p-6 bg-[#D4D0C8] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase">Total Investasi (Modal)</label>
            <div className="p-2 sm:p-3 bg-white border border-gray-400 font-bold text-sm sm:text-lg text-gray-800">{formatRupiah(stats.financial.totalInvestasi)}</div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase">Total Piutang Awal</label>
            <div className="p-2 sm:p-3 bg-white border border-gray-400 font-bold text-sm sm:text-lg text-blue-800">{formatRupiah(stats.financial.totalPiutang)}</div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase">Pemasukan (Diterima)</label>
            <div className="p-2 sm:p-3 bg-white border border-gray-400 font-bold text-sm sm:text-lg text-green-700">{formatRupiah(stats.financial.totalDiterima)}</div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase">Sisa Piutang (Saldo)</label>
            <div className="p-2 sm:p-3 bg-white border border-gray-400 font-bold text-sm sm:text-lg text-red-700">{formatRupiah(stats.financial.sisaPiutang)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== RECENT TRANSACTIONS ===== */}
        <div className="lg:col-span-2 border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
          <div className="bg-[#000080] p-1.5 px-4 text-white font-bold">Aktivitas Pembayaran Terakhir</div>
          <div className="bg-white overflow-x-auto min-h-[300px]">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-100 border-b-2 border-gray-400">
                <tr>
                  <th className="px-3 py-2 border-r border-gray-300 text-left">Nasabah / Barang</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-left">Tgl</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-left">Uraian</th>
                  <th className="px-3 py-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors text-gray-900">
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-bold">{t.setoran.nasabah.nama}</div>
                      <div className="text-[10px] text-gray-500">{t.setoran.namaBarang}</div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {new Date(t.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">{t.periode}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-700">{formatRupiah(t.nominal)}</td>
                  </tr>
                ))}
                {stats.recentTransactions.length === 0 && (
                  <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">Belum ada transaksi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#D4D0C8] p-2 border-t border-gray-400 text-right px-4">
            <Link href="/dashboard/riwayat" className="text-xs text-blue-800 font-bold hover:underline">Lihat Semua Riwayat →</Link>
          </div>
        </div>

        {/* ===== UPCOMING DUE DATES ===== */}
        <div className="border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
          <div className="bg-[#000080] p-1.5 px-4 text-white font-bold">Jatuh Tempo (7 Hari Kedepan)</div>
          <div className="bg-white p-2 min-h-[300px]">
            <div className="space-y-2">
              {stats.upcomingPayments.map((p, i) => (
                <div key={i} className="border border-gray-300 p-2 bg-gray-50 hover:bg-yellow-50 transition-colors text-gray-900">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-gray-800">{p.nasabah.nama}</div>
                    <div className="text-[10px] font-bold bg-red-100 text-red-700 px-1 border border-red-200">
                      TGL {new Date(p.tanggalAngsuranBulanan).getDate()}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-600 mb-2">{p.namaBarang}</div>
                  <div className="flex justify-between items-center border-t border-dotted border-gray-400 pt-2">
                    <span className="text-[10px] font-medium">Tagihan:</span>
                    <span className="font-bold text-blue-800">{formatRupiah(p.nominalPerSetor)}</span>
                  </div>
                </div>
              ))}
              {stats.upcomingPayments.length === 0 && (
                <div className="py-20 text-center text-gray-400 italic text-xs">Tidak ada tagihan mendesak.</div>
              )}
            </div>
          </div>
          <div className="bg-[#D4D0C8] p-2 border-t border-gray-400 text-center px-4">
             <Link href="/dashboard/pembayaran" className="text-xs text-blue-800 font-bold hover:underline">Ke Pembayaran →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
