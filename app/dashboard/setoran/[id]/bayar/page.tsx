"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BayarSetoranPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [setoranDetail, setSetoranDetail] = useState<any>(null)
  const [ubahNominal, setUbahNominal] = useState(false)
  const [selectedRiwayatId, setSelectedRiwayatId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nominal: "",
    metode: "Cash",
    noTransaksi: "",
    periode: "",
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ""
  })

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/nasabah`)
        const data = await response.json()
        const found = data.find((n: any) => n.setoran.some((s: any) => s.id === id))
        if (found) {
          const s = found.setoran.find((s: any) => s.id === id)
          setSetoranDetail({
            kodeNasabah: found.id.substring(0, 8).toUpperCase(),
            nama: found.nama,
            alamat: found.alamat,
            telepon: found.telepon,
            sisaAngsuran: (s.jumlahSetoran - s.jumlahDisetor),
            nominalSaran: s.nominalPerSetor,
            riwayat: s.riwayat || [],
            namaBarang: s.namaBarang,
          })
          const now = new Date()
          const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0')
          const randomStr = Math.floor(1000 + Math.random() * 9000).toString()
          setFormData(prev => ({
            ...prev,
            nominal: formatNumber(s.nominalPerSetor.toString()),
            periode: (s.jumlahDisetor + 1).toString(),
            noTransaksi: `${dateStr}${randomStr}`
          }))
        }
      } catch (error) {
        console.error(error)
      } finally {
        setDataLoading(false)
      }
    }
    fetchDetail()
  }, [id])

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
    setLoading(true)
    try {
      const response = await fetch(`/api/setoran/${id}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nominal: parseFloat(formData.nominal.replace(/\./g, "")),
          periode: `Angsuran ke-${formData.periode}`
        })
      })
      if (response.ok) {
        window.location.reload()
      } else {
        alert("Gagal memproses pembayaran")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setLoading(false)
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
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  const handlePrintStruk = () => {
    if (!selectedRiwayatId) {
      alert("Silakan pilih salah satu transaksi di tabel histori terlebih dahulu.")
      return
    }
    const r = setoranDetail?.riwayat.find((r: any) => r.id === selectedRiwayatId)
    if (!r) return

    const html = `
      <div style="max-width:380px;margin:0 auto;border:2px solid black;padding:32px;font-family:serif">
        <div style="text-align:center;border-bottom:2px solid black;padding-bottom:16px;margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin:0">OESADA UTAMA</h1>
          <p style="font-size:11px;font-weight:bold;margin:4px 0 0">STRUK BUKTI PEMBAYARAN ANGSURAN</p>
          <p style="font-size:10px;font-style:italic;margin:2px 0 0">Stabat, Kab. Langkat</p>
        </div>
        ${[
          ["No. Transaksi", r.noTransaksi],
          ["Nama Nasabah", setoranDetail?.nama?.toUpperCase()],
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
            <p style="font-weight:bold;border-top:1px solid black;padding-top:4px;text-transform:uppercase">${setoranDetail?.nama}</p>
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

  const handlePrintHistory = () => {
    const totalBayar = setoranDetail?.riwayat.reduce((acc: number, curr: any) => acc + curr.nominal, 0) || 0

    const rows = setoranDetail?.riwayat.map((r: any, idx: number) => `
      <tr>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">${idx + 1}</td>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">${new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
        <td style="border:1px solid black;padding:6px 8px;font-family:monospace;font-weight:bold;text-align:center">${r.noTransaksi}</td>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">Pembayaran ${r.periode}</td>
        <td style="border:1px solid black;padding:6px 8px;text-align:right;font-weight:bold">${formatRupiah(r.nominal)}</td>
      </tr>`).join('')

    const html = `
      <div style="font-family:serif;color:black">
        <div style="border-bottom:4px double black;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:16px">
            <div style="width:60px;height:60px;background:#1e3a8a;color:white;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;border-radius:8px">OU</div>
            <div>
              <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;margin:0 0 2px">OESADA UTAMA</h1>
              <p style="font-size:12px;font-weight:bold;margin:0 0 2px">Laporan Histori Pembayaran Angsuran</p>
              <p style="font-size:11px;margin:0">Lingk. IV Lubuk Dalam, Stabat, Kab. Langkat</p>
            </div>
          </div>
          <div style="text-align:right;font-size:12px"><p style="margin:0">Tgl Cetak: ${new Date().toLocaleDateString('id-ID')}</p></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px;background:#f9fafb;padding:12px;border:1px solid black;border-radius:4px;font-size:12px">
          <table style="width:100%;border-collapse:collapse"><tbody>
            <tr><td style="font-weight:bold;width:80px">Nasabah</td><td style="width:10px">:</td><td style="font-weight:bold;text-transform:uppercase">${setoranDetail?.nama}</td></tr>
            <tr><td>ID</td><td>:</td><td>${setoranDetail?.kodeNasabah}</td></tr>
            <tr><td>Alamat</td><td>:</td><td>${setoranDetail?.alamat || "-"}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse"><tbody>
            <tr><td style="font-weight:bold;width:80px">Barang</td><td style="width:10px">:</td><td>${setoranDetail?.namaBarang}</td></tr>
            <tr><td>Sisa Angs.</td><td>:</td><td style="font-weight:bold">${setoranDetail?.sisaAngsuran} Kali</td></tr>
            <tr><td>Status</td><td>:</td><td style="font-weight:bold;text-transform:uppercase">${setoranDetail?.sisaAngsuran === 0 ? "LUNAS" : "AKTIF"}</td></tr>
          </tbody></table>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#e5e7eb">
              <th style="border:1px solid black;padding:8px;font-size:11px">NO</th>
              <th style="border:1px solid black;padding:8px;font-size:11px">TGL BAYAR</th>
              <th style="border:1px solid black;padding:8px;font-size:11px">NO. TRANSAKSI</th>
              <th style="border:1px solid black;padding:8px;font-size:11px">URAIAN</th>
              <th style="border:1px solid black;padding:8px;font-size:11px">NOMINAL</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background:#f3f4f6;font-weight:bold">
              <td colspan="4" style="border:1px solid black;padding:8px;text-align:right;text-transform:uppercase;font-size:11px">Total Dibayarkan :</td>
              <td style="border:1px solid black;padding:8px;text-align:right;font-size:14px">${formatRupiah(totalBayar)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="display:flex;justify-content:flex-end;margin-top:48px;text-align:center">
          <div style="width:220px">
            <p style="margin-bottom:56px;font-size:11px;color:#888;font-style:italic">Dicetak Oleh,</p>
            <p style="font-size:10px;font-weight:bold;border-top:2px solid black;padding-top:6px;text-transform:uppercase;letter-spacing:2px">OESADA UTAMA</p>
          </div>
        </div>
      </div>
    `
    openPrintWindow(html)
  }

  if (dataLoading) return <div className="p-8 text-center text-gray-500 font-mono text-xl animate-pulse">LOADING SYSTEM...</div>

  const totalBayar = setoranDetail?.riwayat.reduce((acc: number, curr: any) => acc + curr.nominal, 0) || 0

  return (
    <div className="p-4 font-sans text-sm">
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        {/* Header Bar */}
        <div className="bg-[#000080] p-1.5 px-4 flex justify-between items-center text-white font-bold">
          <span className="text-base">Pembayaran Angsuran</span>
          <button onClick={() => router.back()} className="bg-[#D4D0C8] text-black px-2 hover:bg-gray-300 border border-white border-b-black border-r-black text-xs font-bold">X</button>
        </div>

        <div className="p-6 bg-[#D4D0C8]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left */}
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium">Kode Nasabah</label>
                <div className="flex gap-1">
                  <input type="text" readOnly value={setoranDetail?.kodeNasabah} className="flex-1 px-2 py-1.5 bg-white border border-gray-400 focus:outline-none" />
                  <button className="px-3 bg-[#D4D0C8] border border-white border-b-gray-600 border-r-gray-600 font-bold">...</button>
                </div>
                <label className="text-left font-medium">Nama</label>
                <input type="text" readOnly value={setoranDetail?.nama} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none" />
                <label className="text-left font-medium">Alamat</label>
                <input type="text" readOnly value={setoranDetail?.alamat} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none" />
                <label className="text-left font-medium">Sisa Angsuran</label>
                <div className="px-2 py-1.5 bg-[#90EE90] border border-gray-400 font-bold text-base">
                  {setoranDetail?.sisaAngsuran} Kali
                </div>
              </div>
              <div className="h-px bg-gray-400 my-4"></div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium leading-tight">Jumlah Bayar Angsuran</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    readOnly={!ubahNominal}
                    value={formData.nominal}
                    onChange={(e) => setFormData({...formData, nominal: formatNumber(e.target.value)})}
                    className={`flex-1 px-3 py-2 border-2 border-blue-600 font-bold text-xl ${ubahNominal ? 'bg-white' : 'bg-gray-100'}`}
                  />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ubahNominal" checked={ubahNominal} onChange={(e) => setUbahNominal(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                    <label htmlFor="ubahNominal" className="cursor-pointer font-bold whitespace-nowrap">Ubah Nominal</label>
                  </div>
                </div>
                <label className="text-left font-medium">Metode</label>
                <select value={formData.metode} onChange={(e) => setFormData({...formData, metode: e.target.value})} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold">
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium">No Transaksi</label>
                <input type="text" readOnly value={formData.noTransaksi} className="px-2 py-1.5 bg-white border-2 border-blue-600 focus:outline-none font-mono font-bold" />
                <label className="text-left font-medium">Tanggal</label>
                <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold" />
                <label className="text-left font-medium">Periode</label>
                <select value={formData.periode} onChange={(e) => setFormData({...formData, periode: e.target.value})} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold">
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <label className="text-left font-medium">Keterangan</label>
                <textarea value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} rows={4} className="px-2 py-2 bg-white border border-gray-400 focus:outline-none resize-none" placeholder="Masukkan keterangan tambahan jika ada..." />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-10 mb-8 border-t-2 border-gray-400 pt-6">
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner flex items-center gap-2 font-bold hover:bg-gray-200">
              <span className="text-blue-600 text-lg">▼</span> <u>B</u>ayar
            </button>
            <button
              onClick={handlePrintStruk}
              className={`px-6 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 ${!selectedRiwayatId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cetak Bukti Bayar
            </button>
            <button onClick={handlePrintHistory} className="px-6 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200">
              Cetak Histori
            </button>
          </div>

          {/* Table */}
          <div className="mt-6 border-2 border-gray-400 bg-white shadow-sm">
            <div className="bg-[#000080] p-1.5 px-4 text-white font-bold border-b-2 border-gray-400 text-center">
              Histori Transaksi — Klik baris untuk pilih Cetak Bukti Bayar
            </div>
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 border-b-2 border-gray-400">
                  <tr>
                    <th className="px-4 py-2 border-r border-gray-300 text-left w-12">No</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">No Transaksi</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">Tgl Transaksi</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-left">Uraian</th>
                    <th className="px-4 py-2 text-right">Nominal Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 cursor-pointer">
                  {setoranDetail?.riwayat.map((r: any, idx: number) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRiwayatId(r.id === selectedRiwayatId ? null : r.id)}
                      className={`transition-colors ${selectedRiwayatId === r.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50'}`}
                    >
                      <td className={`px-4 py-2 border-r text-center ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{idx + 1}</td>
                      <td className={`px-4 py-2 border-r font-mono ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{r.noTransaksi || '-'}</td>
                      <td className={`px-4 py-2 border-r ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className={`px-4 py-2 border-r ${selectedRiwayatId === r.id ? 'border-blue-400' : 'border-gray-200'}`}>Pembayaran {r.periode || '-'}</td>
                      <td className={`px-4 py-2 text-right font-bold ${selectedRiwayatId === r.id ? 'text-white' : 'text-green-700'}`}>{formatRupiah(r.nominal)}</td>
                    </tr>
                  ))}
                  {setoranDetail?.riwayat.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400 italic">Belum ada histori transaksi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 bg-[#D4D0C8] border-2 border-white border-t-gray-600 border-l-gray-600 p-3 flex items-center gap-6">
            <span className="font-bold text-[#000080] text-xl uppercase">Total Bayar :</span>
            <div className="flex-1 bg-white border-2 border-gray-400 px-6 py-2 text-3xl font-bold text-right text-blue-900 shadow-inner">
              {formatRupiah(totalBayar)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
