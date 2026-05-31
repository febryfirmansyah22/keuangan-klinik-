import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan } from '@/lib/utils'
import { ensureSeeded } from '@/lib/seed'

export async function GET(req: NextRequest) {
  await ensureSeeded()
  const bulan = req.nextUrl.searchParams.get('bulan') || ''
  const where = bulan ? { bulan } : {}
  const data = await prisma.fakturObat.findMany({ where, orderBy: { id: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nomor, tanggal, pbfToko, harga, keterangan } = body
  const bulan = getBulan(tanggal)
  const record = await prisma.fakturObat.create({
    data: { nomor, tanggal, pbfToko, harga, keterangan, bulan }
  })
  return NextResponse.json(record)
}
