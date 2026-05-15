"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface PembayaranClientProps {
  nasabahList: any[]
}

export default function PembayaranClient({ nasabahList }: PembayaranClientProps) {
  const router = useRouter()
  const [selectedNasabahId, setSelectedNasabahId] = useState("")
  const [selectedSetoran, setSelectedSetoran] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [ubahNominal, setUbahNominal] = useState(false)
  const [selectedRiwayatId, setSelectedRiwayatId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const [formData, setFormData] = useState({
    nominal: "",
    metode: "Cash",
    noTransaksi: "",
    periode: "",
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ""
  })

  // Handle Nasabah Selection
  useEffect(() => {
    if (selectedNasabahId) {
      const nasabah = nasabahList.find((n: any) => n.id === selectedNasabahId)
      if (nasabah && nasabah.setoran.length > 0) {
        const s = nasabah.setoran[0] // Ambil setoran pertama yang aktif
        setSelectedSetoran({
          ...s,
          nasabahNama: nasabah.nama,
          nasabahAlamat: nasabah.alamat,
          nasabahTelepon: nasabah.telepon,
          kodeNasabah: nasabah.id.substring(0, 8).toUpperCase(),
          sisaAngsuran: (s.jumlahSetoran - s.jumlahDisetor)
        })

        // Ambil No Transaksi terbaru dari riwayat atau dari setoran awal
        const lastNoTransaksi = s.riwayat && s.riwayat.length > 0 
          ? s.riwayat[0].noTransaksi 
          : (s.noTransaksi || "")

        // Reset Form Data for new selection
        setFormData(prev => ({
          ...prev,
          nominal: formatNumber(s.nominalPerSetor.toString()),
          periode: (s.jumlahDisetor + 1).toString(),
          noTransaksi: lastNoTransaksi
        }))
        setSelectedRiwayatId(null)
      }
    } else {
      setSelectedSetoran(null)
    }
  }, [selectedNasabahId, nasabahList])

  const formatNumber = (value: string) => {
    const number = value.toString().replace(/\D/g, "")
    if (!number) return ""
    return new Intl.NumberFormat("id-ID").format(parseInt(number))
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSetoran) return
    
    setLoading(true)
    try {
      const url = isEditMode 
        ? `/api/riwayat/${selectedRiwayatId}` 
        : `/api/setoran/${selectedSetoran.id}/bayar`
      const method = isEditMode ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nominal: parseFloat(formData.nominal.replace(/\./g, "")),
          periode: isEditMode ? formData.periode : `Angsuran ke-${formData.periode}`
        })
      })
      if (response.ok) {
        window.location.reload()
      } else {
        alert(isEditMode ? "Gagal memperbarui pembayaran" : "Gagal memproses pembayaran")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRiwayat = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus histori pembayaran ini? Jumlah setoran nasabah akan berkurang.")) return
    try {
      const response = await fetch(`/api/riwayat/${id}`, { method: "DELETE" })
      if (response.ok) {
        window.location.reload()
      } else {
        alert("Gagal menghapus histori")
      }
    } catch {
      alert("Terjadi kesalahan")
    }
  }

  const handleEditRiwayat = (r: any) => {
    setIsEditMode(true)
    setSelectedRiwayatId(r.id)
    setUbahNominal(true)
    setFormData({
      nominal: formatNumber(r.nominal.toString()),
      periode: r.periode?.replace("Angsuran ke-", "") || "",
      noTransaksi: r.noTransaksi || "",
      tanggal: new Date(r.tanggal).toISOString().split('T')[0],
      metode: r.metode || "Cash",
      keterangan: r.keterangan || ""
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBatalEdit = () => {
    setIsEditMode(false)
    setSelectedRiwayatId(null)
    setUbahNominal(false)
    // Reset to default next payment if a nasabah is selected
    if (selectedSetoran) {
      const lastNoTransaksi = selectedSetoran.riwayat && selectedSetoran.riwayat.length > 0 
        ? selectedSetoran.riwayat[0].noTransaksi 
        : (selectedSetoran.noTransaksi || "")
      
      setFormData({
        nominal: formatNumber(selectedSetoran.nominalPerSetor.toString()),
        periode: (selectedSetoran.jumlahDisetor + 1).toString(),
        noTransaksi: lastNoTransaksi,
        tanggal: new Date().toISOString().split('T')[0],
        metode: "Cash",
        keterangan: ""
      })
    }
  }

  const openPrintWindow = (html: string) => {
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print</title>
        <meta charset="utf-8"/>
        <style>
          @page { margin: 1.2cm; size: A4 portrait; }
          * { box-sizing: border-box; }
          body { font-family: serif; color: black; background: white; margin: 0; padding: 0; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 1000)
  }

  const handlePrintStruk = () => {
    if (!selectedRiwayatId) {
      alert("Silakan pilih salah satu transaksi di tabel histori terlebih dahulu.")
      return
    }
    const r = selectedSetoran?.riwayat.find((r: any) => r.id === selectedRiwayatId)
    if (!r) return

    const html = `
      <div style="max-width:380px;margin:0 auto;border:2px solid black;padding:32px;font-family:serif">
        <div style="text-align:center;border-bottom:2px solid black;padding-bottom:16px;margin-bottom:24px">
          <img src="/logo.png" style="width:50px;height:50px;object-fit:contain;margin-bottom:8px" alt="Logo" />
          <h1 style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin:0">OESADA UTAMA</h1>
          <p style="font-size:11px;font-weight:bold;margin:4px 0 0">STRUK BUKTI PEMBAYARAN ANGSURAN</p>
          <p style="font-size:10px;font-style:italic;margin:2px 0 0">Desa Batu Kumbung Kec. Lingsar Kab. Lombok Barat</p>
        </div>
        ${[
          ["No. Transaksi", r.noTransaksi],
          ["Nama Nasabah", selectedSetoran?.nasabahNama?.toUpperCase()],
          ["Tanggal Bayar", new Date(r.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
          ["Periode", r.periode],
          ["Metode", r.metode],
        ].map(([label, val]) => `
          <div style="display:flex;justify-content:space-between;border-bottom:1px dotted #aaa;padding-bottom:6px;margin-bottom:8px;font-size:13px">
            <span style="font-weight:bold">${label}</span>
            <span style="font-family:monospace">${val}</span>
          </div>`).join('')}
        <div style="background:#f3f4f6;padding:24px;text-align:center;border-top:2px solid black;border-bottom:2px solid black;margin:24px 0">
          <p style="font-size:10px;text-transform:uppercase;font-weight:bold;color:#666;letter-spacing:3px;margin:0 0 6px">JUMLAH DITERIMA</p>
          <h4 style="font-size:32px;font-weight:900;margin:0">${formatRupiah(r.nominal)}</h4>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;text-align:center;margin-top:40px;font-size:11px">
          <div>
            <p style="font-style:italic;color:#888;margin-bottom:56px">Tanda Tangan Nasabah,</p>
            <p style="font-weight:bold;border-top:1px solid black;padding-top:4px;text-transform:uppercase">${selectedSetoran?.nasabahNama}</p>
          </div>
          <div>
            <p style="font-style:italic;color:#888;margin-bottom:56px">Petugas Admin,</p>
            <p style="font-weight:bold;border-top:1px solid black;padding-top:4px">OESADA UTAMA</p>
          </div>
        </div>
        <div style="margin-top:32px;text-align:center;border-top:1px dotted #ccc;padding-top:8px">
          <p style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:2px">Simpan sebagai bukti pembayaran yang sah</p>
        </div>
      </div>
    `
    openPrintWindow(html)
  }



  const totalBayar = selectedSetoran?.riwayat.reduce((acc: number, curr: any) => acc + curr.nominal, 0) || 0

  return (
    <div className="p-4 font-sans text-sm">
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        {/* Header Bar */}
        <div className="bg-[#000080] p-1.5 px-4 flex justify-between items-center text-white font-bold">
          <span className="text-base">Input Pembayaran Angsuran</span>
        </div>

        <div className="p-6 bg-[#D4D0C8]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium text-[#000080] font-bold">Pilih Nasabah</label>
                <select 
                  value={selectedNasabahId} 
                  onChange={(e) => setSelectedNasabahId(e.target.value)}
                  className="px-2 py-1.5 bg-white border-2 border-blue-600 focus:outline-none font-bold text-sm text-gray-900"
                >
                  <option value="">-- Pilih Nasabah --</option>
                  {nasabahList.map(n => (
                    <option key={n.id} value={n.id}>{n.nama} - {n.setoran[0]?.namaBarang}</option>
                  ))}
                </select>

                <label className="text-left font-medium">Kode Nasabah</label>
                <input type="text" readOnly value={selectedSetoran?.kodeNasabah || ""} className="px-2 py-1.5 bg-gray-100 border border-gray-400 focus:outline-none text-gray-900" />
                
                <label className="text-left font-medium">Alamat</label>
                <input type="text" readOnly value={selectedSetoran?.nasabahAlamat || ""} className="px-2 py-1.5 bg-gray-100 border border-gray-400 focus:outline-none text-gray-900" />
                
                <label className="text-left font-medium">Sisa Angsuran</label>
                <div className={`px-2 py-1.5 border border-gray-400 font-bold text-base ${selectedSetoran ? 'bg-[#90EE90]' : 'bg-gray-100'}`}>
                  {selectedSetoran ? `${selectedSetoran.sisaAngsuran} Kali` : "-"}
                </div>
              </div>
              <div className="h-px bg-gray-400 my-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium leading-tight text-gray-900">Jumlah Bayar Angsuran</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    readOnly={!ubahNominal || !selectedSetoran}
                    value={formData.nominal}
                    onChange={(e) => setFormData({...formData, nominal: formatNumber(e.target.value)})}
                    className={`flex-1 min-w-0 px-3 py-2 border-2 border-blue-600 font-bold text-xl text-gray-900 ${ubahNominal && selectedSetoran ? 'bg-white' : 'bg-gray-100'}`}
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="ubahNominal" 
                      disabled={!selectedSetoran}
                      checked={ubahNominal} 
                      onChange={(e) => setUbahNominal(e.target.checked)} 
                      className="w-4 h-4 cursor-pointer" 
                    />
                    <label htmlFor="ubahNominal" className={`cursor-pointer font-bold whitespace-nowrap ${!selectedSetoran ? 'text-gray-400' : ''}`}>Ubah Nominal</label>
                  </div>
                </div>
                <label className="text-left font-medium">Metode</label>
                <select 
                  disabled={!selectedSetoran}
                  value={formData.metode} 
                  onChange={(e) => setFormData({...formData, metode: e.target.value})} 
                  className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold disabled:bg-gray-100 text-gray-900"
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium">No Transaksi</label>
                <input 
                  type="text" 
                  disabled={!selectedSetoran}
                  value={formData.noTransaksi} 
                  onChange={(e) => setFormData({...formData, noTransaksi: e.target.value})}
                  className="px-2 py-1.5 bg-white border-2 border-blue-600 focus:outline-none font-mono font-bold disabled:bg-gray-100 text-gray-900" 
                />
                <label className="text-left font-medium">Tanggal</label>
                <input 
                  type="date" 
                  disabled={!selectedSetoran}
                  value={formData.tanggal} 
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                  className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold disabled:bg-gray-100 text-gray-900" 
                />
                <label className="text-left font-medium">Periode</label>
                <select 
                  disabled={!selectedSetoran}
                  value={formData.periode} 
                  onChange={(e) => setFormData({...formData, periode: e.target.value})} 
                  className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold disabled:bg-gray-100"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <label className="text-left font-medium">Keterangan</label>
                <textarea 
                  disabled={!selectedSetoran}
                  value={formData.keterangan} 
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                  rows={4} 
                  className="px-2 py-2 bg-white border border-gray-400 focus:outline-none resize-none disabled:bg-gray-100" 
                  placeholder="Masukkan keterangan tambahan jika ada..." 
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-10 mb-8 border-t-2 border-gray-400 pt-6">
            <button 
              onClick={handleSubmit} 
              className="flex-1 sm:flex-none px-8 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner flex justify-center items-center gap-2 font-bold hover:bg-gray-200 disabled:opacity-50"
            >
              <span className="text-blue-600 text-lg">▼</span> {isEditMode ? "Simpan Perubahan" : <span><u>B</u>ayar</span>}
            </button>
            {isEditMode && (
              <button 
                onClick={handleBatalEdit} 
                className="flex-1 sm:flex-none px-6 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 text-red-700"
              >
                Batal Edit
              </button>
            )}
            <button
              onClick={handlePrintStruk}
              disabled={!selectedRiwayatId}
              className={`flex-1 sm:flex-none px-6 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 ${!selectedRiwayatId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cetak Bukti
            </button>

          </div>

          {/* Table */}
          <div className="mt-6 border-2 border-gray-400 bg-white shadow-sm">
            <div className="bg-[#000080] p-1.5 px-4 text-white font-bold border-b-2 border-gray-400 text-center">
              Histori Transaksi — {selectedSetoran ? `Nasabah: ${selectedSetoran.nasabahNama}` : "Pilih Nasabah terlebih dahulu"}
            </div>
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 border-b-2 border-gray-400">
                  <tr>
                    <th className="px-4 py-2 border-r border-gray-300 text-left w-12">No</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">No Transaksi</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">Tgl Transaksi</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">Uraian</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-right">Nominal Bayar</th>
                    <th className="px-4 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 cursor-pointer">
                  {selectedSetoran?.riwayat.map((r: any, idx: number) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        if (selectedRiwayatId === r.id && !isEditMode) {
                          setSelectedRiwayatId(null)
                        } else if (!isEditMode) {
                          setSelectedRiwayatId(r.id)
                        }
                      }}
                      className={`transition-colors ${selectedRiwayatId === r.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50'}`}
                    >
                      <td className={`px-4 py-2 border-r text-center ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{idx + 1}</td>
                      <td className={`px-4 py-2 border-r font-mono ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{r.noTransaksi || '-'}</td>
                      <td className={`px-4 py-2 border-r ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className={`px-4 py-2 border-r ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>Pembayaran {r.periode || '-'}</td>
                      <td className={`px-4 py-2 border-r text-right font-bold ${selectedRiwayatId === r.id ? 'text-white' : 'text-green-700'}`}>{formatRupiah(r.nominal)}</td>
                      <td className={`px-4 py-2 text-center ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditRiwayat(r) }}
                            className={`px-2 py-0.5 bg-[#D4D0C8] border border-white border-b-gray-600 border-r-gray-600 active:shadow-inner text-[10px] font-bold hover:bg-gray-200 ${selectedRiwayatId === r.id ? 'text-white' : 'text-amber-700'}`}
                          >Edit</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRiwayat(r.id) }}
                            className={`px-2 py-0.5 bg-[#D4D0C8] border border-white border-b-gray-600 border-r-gray-600 active:shadow-inner text-[10px] font-bold hover:bg-gray-200 ${selectedRiwayatId === r.id ? 'text-white' : 'text-red-700'}`}
                          >Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!selectedSetoran || selectedSetoran.riwayat.length === 0) && (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400 italic">{selectedSetoran ? "Belum ada histori transaksi." : "Silakan pilih nasabah."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 bg-[#D4D0C8] border-2 border-white border-t-gray-600 border-l-gray-600 p-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="font-bold text-[#000080] text-lg sm:text-xl uppercase">Total Bayar :</span>
            <div className="flex-1 bg-white border-2 border-gray-400 px-4 sm:px-6 py-2 text-2xl sm:text-3xl font-bold text-right text-blue-900 shadow-inner">
              {formatRupiah(totalBayar)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
