import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const nasabah = await prisma.nasabah.findMany({
      include: {
        setoran: {
          include: {
            riwayat: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(nasabah)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch nasabah" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
      tanggalKredit, tanggalJatuhTempo, hariJatuhTempo
    } = body

    const nasabah = await prisma.nasabah.create({
      data: {
        nama,
        alamat,
        telepon,
        setoran: {
          create: {
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
            hariJatuhTempo: hariJatuhTempo || null,
            jumlahSetoran: targetAngsuran, // Link to existing logic
            status: "aktif"
          } as any
        }
      }
    })

    return NextResponse.json(nasabah)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create nasabah" }, { status: 500 })
  }
}
