import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, password } = body

    // Cek apakah email sudah digunakan oleh user lain
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 })
      }
    }

    const updateData: any = { name, email }

    // Jika password diisi, hash password baru
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      user: { name: updatedUser.name, email: updatedUser.email } 
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 })
  }
}
