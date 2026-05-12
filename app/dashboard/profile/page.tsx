import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await auth()

  if (!session || !session.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <ProfileClient user={user} />
    </div>
  )
}
