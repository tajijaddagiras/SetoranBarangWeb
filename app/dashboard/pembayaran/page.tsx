import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PembayaranClient from "./PembayaranClient"

export default async function PembayaranPage() {
  const session = await auth()
  if (!session) redirect("/login")

  // Ambil semua nasabah beserta setoran aktif dan riwayatnya
  const nasabahList = await prisma.nasabah.findMany({
    include: {
      setoran: {
        where: { status: "aktif" },
        include: {
          riwayat: {
            orderBy: { tanggal: 'desc' }
          }
        }
      }
    },
    orderBy: { nama: 'asc' }
  })

  // Filter hanya nasabah yang punya setoran aktif
  const nasabahAktif = nasabahList.filter(n => n.setoran.length > 0)

  return <PembayaranClient nasabahList={nasabahAktif} />
}
