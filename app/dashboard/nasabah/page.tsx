import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NasabahClient from "./NasabahClient"

export default async function NasabahListPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const nasabah = await prisma.nasabah.findMany({
    include: {
      setoran: {
        include: {
          riwayat: {
            orderBy: {
              tanggal: 'desc'
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <NasabahClient nasabah={nasabah} />
}
