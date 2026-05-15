import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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

    await prisma.riwayatSetoran.update({
      where: { id },
      data: {
        nominal,
        keterangan,
        metode,
        noTransaksi,
        periode: `Angsuran ke-${periode}`,
        tanggal: tanggal ? new Date(tanggal) : undefined
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update riwayat" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const riwayat = await prisma.riwayatSetoran.findUnique({
      where: { id },
      include: { setoran: true }
    })

    if (!riwayat) {
      return NextResponse.json({ error: "Riwayat not found" }, { status: 404 })
    }

    const setoranId = riwayat.setoranId

    // Delete the record
    await prisma.riwayatSetoran.delete({
      where: { id }
    })

    // Update parent setoran
    const setoran = await prisma.setoran.findUnique({
      where: { id: setoranId }
    })

    if (setoran) {
      const newJumlahDisetor = Math.max(0, setoran.jumlahDisetor - 1)
      const isLunas = newJumlahDisetor >= setoran.jumlahSetoran

      await prisma.setoran.update({
        where: { id: setoranId },
        data: {
          jumlahDisetor: newJumlahDisetor,
          status: isLunas ? "lunas" : "aktif"
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete riwayat" }, { status: 500 })
  }
}
