import { PrismaClient } from "@prisma/client"

import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
   const password = await bcrypt.hash("asd", 10)

   const admin = await prisma.user.upsert({
      where: { email: "admin@gmail.com" },
      update: {},
      create: {
         email: "admin@gmail.com",
         username: "admin",
         password,
         role: "admin",
      },
   })
}

main()
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
   .finally(() => {
      prisma.$disconnect()
   })
