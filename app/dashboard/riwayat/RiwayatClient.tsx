"use client"

import { useState, useEffect } from "react"

interface RiwayatClientProps {
  setoranList: any[]
}

export default function RiwayatClient({ setoranList }: RiwayatClientProps) {
  const [selectedSetoranId, setSelectedSetoranId] = useState("")
  const [selectedSetoran, setSelectedSetoran] = useState<any>(null)

  useEffect(() => {
    if (selectedSetoranId) {
      const s = setoranList.find((item: any) => item.id === selectedSetoranId)
      if (s) {
        setSelectedSetoran({
          ...s,
          kodeNasabah: s.nasabah.id.substring(0, 8).toUpperCase(),
          sisaAngsuran: (s.jumlahSetoran - s.jumlahDisetor)
        })
      }
    } else {
      setSelectedSetoran(null)
    }
  }, [selectedSetoranId, setoranList])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
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

  const handlePrintHistory = () => {
    if (!selectedSetoran) return
    const totalBayar = selectedSetoran.riwayat.reduce((acc: number, curr: any) => acc + curr.nominal, 0) || 0
    const sisaTagihan = (selectedSetoran.jumlahSetoran - selectedSetoran.jumlahDisetor) * selectedSetoran.nominalPerSetor

    const rows = selectedSetoran.riwayat.map((r: any, idx: number) => `
      <tr>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">${idx + 1}</td>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">${new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
        <td style="border:1px solid black;padding:6px 8px;font-family:monospace;font-weight:bold;text-align:center">${r.noTransaksi || '-'}</td>
        <td style="border:1px solid black;padding:6px 8px;text-align:center">Pembayaran ${r.periode || '-'}</td>
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
            <tr><td style="font-weight:bold;width:100px">Nasabah</td><td style="width:10px">:</td><td style="font-weight:bold;text-transform:uppercase">${selectedSetoran.nasabah.nama}</td></tr>
            <tr><td>ID Nasabah</td><td>:</td><td>${selectedSetoran.kodeNasabah}</td></tr>
            <tr><td>Alamat</td><td>:</td><td>${selectedSetoran.nasabah.alamat || "-"}</td></tr>
            <tr><td>Telepon</td><td>:</td><td>${selectedSetoran.nasabah.telepon || "-"}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse"><tbody>
            <tr><td style="font-weight:bold;width:100px">Nama Barang</td><td style="width:10px">:</td><td style="font-weight:bold">${selectedSetoran.namaBarang}</td></tr>
            <tr><td>Progress Bayar</td><td>:</td><td style="font-weight:bold">${selectedSetoran.jumlahDisetor} / ${selectedSetoran.jumlahSetoran} Kali</td></tr>
            <tr><td>Sisa Tagihan</td><td>:</td><td style="font-weight:bold;color:red">${formatRupiah(sisaTagihan)}</td></tr>
            <tr><td>Status Kredit</td><td>:</td><td style="font-weight:bold;text-transform:uppercase">${selectedSetoran.status}</td></tr>
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

  const totalBayar = selectedSetoran?.riwayat.reduce((acc: number, curr: any) => acc + curr.nominal, 0) || 0

  return (
    <div className="p-4 font-sans text-sm space-y-4">
      {/* ===== SELECTION CARD ===== */}
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        <div className="bg-[#000080] p-1.5 px-4 flex justify-between items-center text-white font-bold">
          <span className="text-base">Detail Riwayat Setoran Nasabah</span>
        </div>

        <div className="p-6 bg-[#D4D0C8]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium text-[#000080] font-bold">Pilih Nasabah</label>
                <select 
                  value={selectedSetoranId} 
                  onChange={(e) => setSelectedSetoranId(e.target.value)}
                  className="px-2 py-1.5 bg-white border-2 border-blue-600 focus:outline-none font-bold text-sm text-gray-900"
                >
                  <option value="">-- Pilih Nasabah / Barang --</option>
                  {setoranList.map(s => (
                    <option key={s.id} value={s.id}>{s.nasabah.nama} - {s.namaBarang} ({s.status.toUpperCase()})</option>
                  ))}
                </select>

                <label className="text-left font-medium">Nama Nasabah</label>
                <input type="text" readOnly value={selectedSetoran?.nasabah.nama || ""} className="px-2 py-1.5 bg-gray-100 border border-gray-400 focus:outline-none font-bold text-gray-900" />
                
                <label className="text-left font-medium">Alamat</label>
                <input type="text" readOnly value={selectedSetoran?.nasabah.alamat || ""} className="px-2 py-1.5 bg-gray-100 border border-gray-400 focus:outline-none text-gray-900" />
                
                <label className="text-left font-medium">Status Kredit</label>
                <div className={`px-2 py-1 font-bold text-sm uppercase inline-block border border-gray-400 ${selectedSetoran?.status === 'lunas' ? 'bg-green-100 text-green-700' : selectedSetoran ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                  {selectedSetoran?.status || "-"}
                </div>
              </div>
            </div>

            {/* Info Summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-y-3">
                <label className="text-left font-medium">Nama Barang</label>
                <input type="text" readOnly value={selectedSetoran?.namaBarang || ""} className="px-2 py-1.5 bg-white border border-gray-400 focus:outline-none font-bold text-gray-900" />
                
                <label className="text-left font-medium">Progress Bayar</label>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{selectedSetoran ? `${selectedSetoran.jumlahDisetor} / ${selectedSetoran.jumlahSetoran} Kali` : "-"}</span>
                  {selectedSetoran && (
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(selectedSetoran.jumlahDisetor / selectedSetoran.jumlahSetoran) * 100}%` }} />
                    </div>
                  )}
                </div>

                <label className="text-left font-medium">Sisa Tagihan</label>
                <div className="px-2 py-1.5 bg-white border border-gray-400 font-bold text-lg text-red-700">
                  {selectedSetoran ? formatRupiah((selectedSetoran.jumlahSetoran - selectedSetoran.jumlahDisetor) * selectedSetoran.nominalPerSetor) : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-400 flex justify-center sm:justify-end">
            <button 
              onClick={handlePrintHistory} 
              disabled={!selectedSetoran}
              className="w-full sm:w-auto px-10 py-2 bg-[#D4D0C8] border-2 border-white border-b-gray-600 border-r-gray-600 active:shadow-inner font-bold hover:bg-gray-200 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <span>🖨️</span> Cetak Laporan Histori
            </button>
          </div>
        </div>
      </div>

      {/* ===== HISTORY TABLE CARD ===== */}
      <div className="w-full border-2 border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
        <div className="bg-[#000080] p-1.5 px-4 text-white font-bold text-center">
          Daftar Seluruh Riwayat Setoran
        </div>
        <div className="bg-white overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 border-b-2 border-gray-400">
              <tr>
                <th className="px-4 py-2 border-r border-gray-300 text-left w-12">No</th>
                <th className="px-4 py-2 border-r border-gray-300 text-left">No Transaksi</th>
                <th className="px-4 py-2 border-r border-gray-300 text-left">Tgl Transaksi</th>
                <th className="px-4 py-2 border-r border-gray-300 text-left">Uraian Periode</th>
                <th className="px-4 py-2 border-r border-gray-300 text-left">Metode</th>
                <th className="px-4 py-2 text-right">Nominal Bayar</th>
              </tr>
            </thead>
            <tbody>
              {selectedSetoran?.riwayat.map((r: any, idx: number) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                  <td className="px-4 py-2 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2 border-r border-gray-200 font-mono font-bold">{r.noTransaksi || '-'}</td>
                  <td className="px-4 py-2 border-r border-gray-200">{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-2 border-r border-gray-200 font-medium">Pembayaran {r.periode || '-'}</td>
                  <td className="px-4 py-2 border-r border-gray-200">{r.metode || 'Cash'}</td>
                  <td className="px-4 py-2 text-right font-bold text-green-700">{formatRupiah(r.nominal)}</td>
                </tr>
              ))}
              {(!selectedSetoran || selectedSetoran.riwayat.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-gray-400 italic">
                    {selectedSetoran ? "Belum ada histori transaksi untuk nasabah ini." : "Silakan pilih nasabah untuk melihat riwayat setoran."}
                  </td>
                </tr>
              )}
            </tbody>
            {selectedSetoran && selectedSetoran.riwayat.length > 0 && (
              <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-400">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right uppercase">Total Dibayarkan :</td>
                  <td className="px-4 py-3 text-right text-blue-900 text-lg">{formatRupiah(totalBayar)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
