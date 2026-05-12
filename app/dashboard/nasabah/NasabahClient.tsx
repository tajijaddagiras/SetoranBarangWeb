"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface NasabahClientProps {
  nasabah: any[]
}

export default function NasabahClient({ nasabah }: NasabahClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentIds, setCurrentIds] = useState<{nasabahId: string, setoranId: string} | null>(null)
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  
  const today = new Date().toISOString().split('T')[0]
  
  const initialForm = {
    nama: "", alamat: "", telepon: "",
    namaBarang: "", noTransaksi: "", hargaModal: "", hargaJual: "", dp: "",
    jangkaWaktu: "", targetAngsuran: "", totalAngsuran: "",
    nominalPerSetor: "", keuntungan: "",
    tanggalKredit: today, tanggalJatuhTempo: "", tanggalAngsuranBulanan: ""
  }

  const [formData, setFormData] = useState(initialForm)
  const router = useRouter()

  useEffect(() => {
    const hModal = parseFloat(formData.hargaModal.toString().replace(/\./g, "")) || 0
    const hJual = parseFloat(formData.hargaJual.toString().replace(/\./g, "")) || 0
    const dpVal = parseFloat(formData.dp.toString().replace(/\./g, "")) || 0
    const jangkawaktu = parseInt(formData.jangkaWaktu.toString()) || 0
    const totalAngs = hJual - dpVal
    const profit = hJual - hModal
    const perBulan = jangkawaktu > 0 ? totalAngs / jangkawaktu : 0
    setFormData(prev => ({
      ...prev,
      totalAngsuran: formatNumber(totalAngs.toString()),
      nominalPerSetor: formatNumber(perBulan.toString()),
      keuntungan: formatNumber(profit.toString())
    }))
  }, [formData.hargaModal, formData.hargaJual, formData.dp, formData.jangkaWaktu])

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "")
    if (!number) return ""
    return new Intl.NumberFormat("id-ID").format(parseInt(number))
  }

  const cekSetorBulanIni = (riwayat: any[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return riwayat.some(r => new Date(r.tanggal) >= startOfMonth)
  }

  const handleEdit = (n: any, s: any) => {
    setIsEditMode(true)
    setCurrentIds({ nasabahId: n.id, setoranId: s.id })
    setSelectedRow(s.id)
    setFormData({
      nama: n.nama, alamat: n.alamat || "", telepon: n.telepon || "",
      namaBarang: s.namaBarang,
      noTransaksi: s.noTransaksi || "",
      hargaModal: formatNumber(s.hargaModal.toString()),
      hargaJual: formatNumber(s.hargaJual.toString()),
      dp: formatNumber(s.dp.toString()),
      jangkaWaktu: s.jangkaWaktu.toString(),
      targetAngsuran: s.targetAngsuran.toString(),
      totalAngsuran: formatNumber(s.totalAngsuran.toString()),
      nominalPerSetor: formatNumber(s.nominalPerSetor.toString()),
      keuntungan: formatNumber(s.keuntungan.toString()),
      tanggalKredit: new Date(s.tanggalKredit).toISOString().split('T')[0],
      tanggalJatuhTempo: s.tanggalJatuhTempo ? new Date(s.tanggalJatuhTempo).toISOString().split('T')[0] : "",
      tanggalAngsuranBulanan: s.tanggalAngsuranBulanan ? new Date(s.tanggalAngsuranBulanan).toISOString().split('T')[0] : ""
    })
    // Scroll ke atas form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus nasabah ini? Semua data setoran dan riwayat akan ikut terhapus.")) return
    try {
      const response = await fetch(`/api/nasabah/${id}`, { method: "DELETE" })
      if (response.ok) { router.refresh() }
      else { alert("Gagal menghapus nasabah") }
    } catch { alert("Terjadi kesalahan") }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...formData,
      hargaModal: parseFloat(formData.hargaModal.replace(/\./g, "")),
      hargaJual: parseFloat(formData.hargaJual.replace(/\./g, "")),
      dp: parseFloat(formData.dp.replace(/\./g, "")),
      totalAngsuran: parseFloat(formData.totalAngsuran.replace(/\./g, "")),
      nominalPerSetor: parseFloat(formData.nominalPerSetor.replace(/\./g, "")),
      keuntungan: parseFloat(formData.keuntungan.replace(/\./g, "")),
      jangkaWaktu: parseInt(formData.jangkaWaktu),
      targetAngsuran: parseInt(formData.targetAngsuran),
      setoranId: currentIds?.setoranId
    }
    try {
      const url = isEditMode ? `/api/nasabah/${currentIds?.nasabahId}` : "/api/nasabah"
      const method = isEditMode ? "PUT" : "POST"
      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        setFormData(initialForm)
        setIsEditMode(false)
        setCurrentIds(null)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(isEditMode ? "Gagal memperbarui nasabah" : "Gagal menambahkan nasabah")
      }
    } catch { alert("Terjadi kesalahan") }
    finally { setLoading(false) }
  }

  const handleBatal = () => {
    setFormData(initialForm)
    setIsEditMode(false)
    setCurrentIds(null)
    setSelectedRow(null)
  }

  const filteredNasabah = nasabah.filter((n) =>
    n.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.setoran.some((s: any) => s.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const inputClass = "px-2 py-1.5 bg-white border border-gray-400 focus:outline-none focus:border-blue-500 w-full font-medium text-sm"
  const readonlyClass = "px-2 py-1.5 bg-gray-100 border border-gray-300 w-full font-bold text-blue-800 text-sm"
  const labelClass = "text-left font-medium text-sm"

  return (
    <div className="p-4 font-sans text-sm space-y-4">
      {/* ===== FORM CARD ===== */}
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="bg-[#000080] p-1.5 px-4 flex justify-between items-center text-white font-bold">
          <span className="text-base">{isEditMode ? "Edit Data Kredit Nasabah" : "Registrasi Kredit Nasabah"}</span>
        </div>

        <div className="p-6 bg-[#D4D0C8]">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Info Nasabah */}
            <div className="mb-1 px-1">
              <span className="text-xs font-bold text-[#000080] uppercase tracking-widest border-b border-[#000080] pb-0.5">— Informasi Nasabah</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 mb-6 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
                <label className={labelClass}>Nama *</label>
                <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
                <label className={labelClass}>Telepon *</label>
                <input type="text" required value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
                <label className={labelClass}>Alamat</label>
                <input type="text" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Section 2: Info Kredit */}
            <div className="mb-1 px-1">
              <span className="text-xs font-bold text-[#000080] uppercase tracking-widest border-b border-[#000080] pb-0.5">— Informasi Barang & Kredit</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Nama Barang *</label>
                <input type="text" required value={formData.namaBarang} onChange={(e) => setFormData({...formData, namaBarang: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>No. Transaksi</label>
                <input type="text" value={formData.noTransaksi} onChange={(e) => setFormData({...formData, noTransaksi: e.target.value})} className={inputClass} placeholder="Boleh kosong" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Tgl Kredit *</label>
                <input type="date" required value={formData.tanggalKredit} onChange={(e) => setFormData({...formData, tanggalKredit: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Jatuh Tempo *</label>
                <input type="date" required value={formData.tanggalJatuhTempo} onChange={(e) => setFormData({...formData, tanggalJatuhTempo: e.target.value})} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Harga Modal</label>
                <input type="text" value={formData.hargaModal} onChange={(e) => setFormData({...formData, hargaModal: formatNumber(e.target.value)})} className={`${inputClass} text-orange-600 font-bold`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Harga Jual *</label>
                <input type="text" required value={formData.hargaJual} onChange={(e) => setFormData({...formData, hargaJual: formatNumber(e.target.value)})} className={`${inputClass} text-blue-600 font-bold`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>DP / Uang Muka</label>
                <input type="text" value={formData.dp} onChange={(e) => setFormData({...formData, dp: formatNumber(e.target.value)})} className={`${inputClass} text-green-700 font-bold`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Jangka Waktu</label>
                <input type="number" value={formData.jangkaWaktu} onChange={(e) => setFormData({...formData, jangkaWaktu: e.target.value})} className={inputClass} placeholder="Bulan" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Target Angsuran *</label>
                <input type="number" required value={formData.targetAngsuran} onChange={(e) => setFormData({...formData, targetAngsuran: e.target.value})} className={inputClass} placeholder="Kali" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Total Angsuran</label>
                <input type="text" readOnly value={formData.totalAngsuran} className={readonlyClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Nominal/Bulan</label>
                <input type="text" readOnly value={formData.nominalPerSetor} className={readonlyClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                <label className={labelClass}>Tgl Angs. Bulanan</label>
                <input type="date" value={formData.tanggalAngsuranBulanan} onChange={(e) => setFormData({...formData, tanggalAngsuranBulanan: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t-2 border-gray-400">
              <button type="submit" disabled={loading} className="px-8 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner flex items-center gap-2 font-bold hover:bg-gray-200">
                <span className="text-blue-600 text-lg">▼</span>
                {loading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Daftarkan Nasabah")}
              </button>
              {isEditMode && (
                <button type="button" onClick={handleBatal} className="px-6 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 text-red-700">
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ===== DATA TABLE CARD ===== */}
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="bg-[#000080] p-1.5 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-white font-bold">
          <span className="text-base">Data Nasabah</span>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari nasabah atau barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-0.5 text-black text-xs bg-white border border-white focus:outline-none w-full sm:w-56"
            />
            <svg className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead className="bg-gray-100 border-b-2 border-gray-400">
              <tr>
                <th className="px-3 py-2 border-r border-gray-300 text-left w-8">No</th>
                <th className="px-3 py-2 border-r border-gray-300 text-left">Nasabah</th>
                <th className="px-3 py-2 border-r border-gray-300 text-left">Barang</th>
                <th className="px-3 py-2 border-r border-gray-300 text-center">Progress</th>
                <th className="px-3 py-2 border-r border-gray-300 text-right">Sisa Tagihan</th>
                <th className="px-3 py-2 border-r border-gray-300 text-center">Status</th>
                <th className="px-3 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNasabah.map((n, ni) =>
                n.setoran.map((s: any, si: number) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedRow(s.id === selectedRow ? null : s.id)}
                    className={`transition-colors cursor-pointer ${selectedRow === s.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-3 py-2 border-r border-gray-200 text-center text-gray-500">{ni + 1}</td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-bold text-gray-900">{n.nama}</div>
                      <div className="text-xs text-gray-500">{n.telepon}</div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-bold text-gray-900">{s.namaBarang}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{s.noTransaksi || '-'}</div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 text-center">
                      <div className="text-xs font-bold text-gray-600 mb-1">{s.jumlahDisetor}/{s.jumlahSetoran}</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(s.jumlahDisetor / s.jumlahSetoran) * 100}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 text-right font-bold">
                      {formatRupiah((s.jumlahSetoran - s.jumlahDisetor) * s.nominalPerSetor)}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 text-center">
                      {cekSetorBulanIni(s.riwayat) ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">LUNAS BULAN INI</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase">BELUM SETOR</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(n, s) }}
                          className="px-3 py-1 bg-[#D4D0C8] border border-white border-b-gray-600 border-r-gray-600 active:shadow-inner text-xs font-bold hover:bg-gray-200 text-amber-700"
                          title="Edit"
                        >Edit</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                          className="px-3 py-1 bg-[#D4D0C8] border border-white border-b-gray-600 border-r-gray-600 active:shadow-inner text-xs font-bold hover:bg-gray-200 text-red-700"
                          title="Hapus"
                        >Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {filteredNasabah.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400 italic">Belum ada data nasabah.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="bg-[#D4D0C8] border-t-2 border-gray-400 p-2 px-4 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600">
            Total: {filteredNasabah.reduce((acc: number, n) => acc + n.setoran.length, 0)} data
          </span>
          {selectedRow && (
            <span className="text-xs font-bold text-blue-700 italic">1 baris dipilih — Klik tombol Edit untuk mengubah</span>
          )}
        </div>
      </div>
    </div>
  )
}
