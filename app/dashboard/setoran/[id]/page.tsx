import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DetailSetoranPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const setoran = await prisma.setoran.findUnique({
    where: { id },
    include: {
      nasabah: true,
      riwayat: {
        orderBy: {
          tanggal: 'desc'
        }
      }
    }
  })

  if (!setoran) {
    return <div>Setoran tidak ditemukan</div>
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTanggal = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const sisaSetoran = setoran.jumlahSetoran - setoran.jumlahDisetor
  const sisaNominal = sisaSetoran * setoran.nominalPerSetor

  return (
    <div className="">
      <div className="max-w-5xl mx-auto">
        {/* Info Nasabah & Barang */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Data Nasabah</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Nama:</span> {setoran.nasabah.nama}</p>
                <p><span className="font-medium">Telepon:</span> {setoran.nasabah.telepon || "-"}</p>
                <p><span className="font-medium">Alamat:</span> {setoran.nasabah.alamat || "-"}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Data Barang</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Nama Barang:</span> {setoran.namaBarang}</p>
                <p><span className="font-medium">Harga Jual:</span> {formatRupiah(setoran.hargaJual)}</p>
                <p><span className="font-medium">Keuntungan/Bulan:</span> {formatRupiah(setoran.keuntungan)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Setoran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Progress Setoran</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <p className="text-sm font-medium text-blue-600 mb-1">Total Setoran</p>
              <p className="text-2xl font-bold text-blue-900">{setoran.jumlahSetoran}x</p>
            </div>
            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
              <p className="text-sm font-medium text-green-600 mb-1">Sudah Disetor</p>
              <p className="text-2xl font-bold text-green-900">{setoran.jumlahDisetor}x</p>
            </div>
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
              <p className="text-sm font-medium text-orange-600 mb-1">Sisa Setoran</p>
              <p className="text-2xl font-bold text-orange-900">{sisaSetoran}x</p>
            </div>
            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
              <p className="text-sm font-medium text-purple-600 mb-1">Sisa Nominal</p>
              <p className="text-2xl font-bold text-purple-900">{formatRupiah(sisaNominal)}</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round((setoran.jumlahDisetor / setoran.jumlahSetoran) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${(setoran.jumlahDisetor / setoran.jumlahSetoran) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              setoran.status === 'lunas' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {setoran.status.toUpperCase()}
            </span>
          </div>

          {setoran.status === 'aktif' && (
            <div className="mt-4">
              <Link
                href={`/dashboard/setoran/${setoran.id}/bayar`}
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Bayar Setoran
              </Link>
            </div>
          )}
        </div>

        {/* Riwayat Setoran */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Riwayat Setoran</h2>
          
          {setoran.riwayat.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada riwayat setoran</p>
          ) : (
            <div className="space-y-3">
              {setoran.riwayat.map((r, index) => (
                <div key={r.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Setoran ke-{setoran.riwayat.length - index}</p>
                      <p className="text-sm text-gray-600">{formatTanggal(r.tanggal)}</p>
                      {r.keterangan && (
                        <p className="text-sm text-gray-500 mt-1">{r.keterangan}</p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatRupiah(r.nominal)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
