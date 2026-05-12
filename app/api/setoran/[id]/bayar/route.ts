import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nominal, keterangan, metode, noTransaksi, periode, tanggal } = body

    const setoran = await prisma.setoran.findUnique({
      where: { id }
    })

    if (!setoran) {
      return NextResponse.json({ error: "Setoran not found" }, { status: 404 })
    }

    // Buat riwayat setoran
    await prisma.riwayatSetoran.create({
      data: {
        setoranId: id,
        nominal,
        keterangan,
        metode: metode || "Tunai",
        noTransaksi,
        periode,
        tanggal: tanggal ? new Date(tanggal) : new Date()
      } as any
    })

    // Update jumlah disetor
    const newJumlahDisetor = setoran.jumlahDisetor + 1
    const isLunas = newJumlahDisetor >= setoran.jumlahSetoran

    await prisma.setoran.update({
      where: { id },
      data: {
        jumlahDisetor: newJumlahDisetor,
        status: isLunas ? "lunas" : "aktif"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
