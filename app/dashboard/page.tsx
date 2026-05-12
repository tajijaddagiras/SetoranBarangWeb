import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Ambil data nasabah dengan setoran
  const allSetoran = await prisma.setoran.findMany({
    include: {
      nasabah: true,
      riwayat: {
        orderBy: { tanggal: 'desc' }
      }
    }
  })

  // Statistik Utama
  const totalNasabah = await prisma.nasabah.count()
  const setoranAktif = await prisma.setoran.count({ where: { status: 'aktif' } })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Keuntungan Bulan Ini (dari setoran yang ditambahkan bulan ini)
  const keuntunganBulanIni = await prisma.setoran.aggregate({
    where: { tanggalKredit: { gte: startOfMonth } } as any,
    _sum: { keuntungan: true }
  })

  // Nasabah yang sudah setor bulan ini
  const nasabahSetorBulanIniCount = await prisma.riwayatSetoran.groupBy({
    by: ['setoranId'],
    where: { tanggal: { gte: startOfMonth } }
  })

  // Ringkasan Keuangan Keseluruhan
  const financialTotals = allSetoran.reduce((acc: { totalInvestasi: number, totalPiutangAwal: number, totalDiterima: number }, s: any) => {
    acc.totalInvestasi += s.hargaModal
    acc.totalPiutangAwal += s.hargaJual
    acc.totalDiterima += (s.dp + s.riwayat.reduce((sum: number, r: any) => sum + r.nominal, 0))
    return acc
  }, { totalInvestasi: 0, totalPiutangAwal: 0, totalDiterima: 0 })

  const sisaPiutang = financialTotals.totalPiutangAwal - financialTotals.totalDiterima

  // Transaksi Terakhir
  const recentTransactions = await prisma.riwayatSetoran.findMany({
    take: 5,
    orderBy: { tanggal: 'desc' },
    include: {
      setoran: {
        include: { nasabah: true }
      }
    }
  })

  // Nasabah yang akan jatuh tempo (dalam 7 hari)
  const next7Days = new Date()
  next7Days.setDate(now.getDate() + 7)

  const upcomingPayments = allSetoran.filter((s: any) => {
    if (s.status !== 'aktif' || !s.tanggalAngsuranBulanan) return false
    const tgl = new Date(s.tanggalAngsuranBulanan)
    // Cek hanya hari dan bulan (asumsi jatuh tempo tiap bulan di tanggal yang sama)
    // Namun untuk dashboard ini kita cek tgl spesifik terdekat
    return tgl >= now && tgl <= next7Days
  }).slice(0, 5)

  const stats = {
    totalNasabah,
    setoranAktif,
    keuntunganBulanIni: keuntunganBulanIni._sum?.keuntungan || 0,
    nasabahSetorBulanIni: nasabahSetorBulanIniCount.length,
    financial: {
      totalInvestasi: financialTotals.totalInvestasi,
      totalPiutang: financialTotals.totalPiutangAwal,
      totalDiterima: financialTotals.totalDiterima,
      sisaPiutang: sisaPiutang > 0 ? sisaPiutang : 0
    },
    recentTransactions,
    upcomingPayments
  }

  return <DashboardClient stats={stats} />
}
