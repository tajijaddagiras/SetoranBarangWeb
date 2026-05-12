import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RiwayatClient from "./RiwayatClient"

export default async function RiwayatPage() {
  const session = await auth()
  if (!session) redirect("/login")

  // Ambil semua data setoran (aktif maupun lunas) beserta detailnya
  const setoranList = await prisma.setoran.findMany({
    include: {
      nasabah: true,
      riwayat: {
        orderBy: { tanggal: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <RiwayatClient setoranList={setoranList} />
}
