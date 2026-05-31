import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Di Vercel filesystem read-only kecuali /tmp.
// Salin DB seed yang sudah terisi ke /tmp agar bisa dibaca & ditulis.
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

if (process.env.VERCEL) {
  const tmpDb = '/tmp/keuangan.db'
  if (!fs.existsSync(tmpDb)) {
    const seedDb = path.join(process.cwd(), 'prisma', 'seed.db')
    if (fs.existsSync(seedDb)) {
      fs.copyFileSync(seedDb, tmpDb)
    }
  }
  dbUrl = 'file:' + tmpDb
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ datasources: { db: { url: dbUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
