import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    // Menghapus nasabah akan menghapus setoran dan riwayat karena Cascade Delete di prisma schema
    await prisma.nasabah.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete nasabah" }, { status: 500 })
  }
}

export async function PUT(
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
    const { 
      nama, alamat, telepon, 
      namaBarang, noTransaksi, hargaModal, hargaJual, dp, 
      jangkaWaktu, targetAngsuran, totalAngsuran, nominalPerSetor, keuntungan,
      tanggalKredit, tanggalJatuhTempo, tanggalAngsuranBulanan,
      setoranId // We need the setoran ID to update it
    } = body

    // Update Nasabah
    await prisma.nasabah.update({
      where: { id },
      data: {
        nama,
        alamat,
        telepon,
        setoran: {
          update: {
            where: { id: setoranId },
            data: {
              namaBarang,
              noTransaksi,
              hargaModal,
              hargaJual,
              dp,
              jangkaWaktu,
              targetAngsuran,
              totalAngsuran,
              nominalPerSetor,
              keuntungan,
              tanggalKredit: new Date(tanggalKredit),
              tanggalJatuhTempo: tanggalJatuhTempo ? new Date(tanggalJatuhTempo) : null,
              tanggalAngsuranBulanan: tanggalAngsuranBulanan ? new Date(tanggalAngsuranBulanan) : null,
            } as any
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update nasabah" }, { status: 500 })
  }
}
