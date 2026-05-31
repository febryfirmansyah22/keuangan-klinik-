import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan, getMinggu } from '@/lib/utils'
import { ensureSeeded } from '@/lib/seed'

export async function GET(req: NextRequest) {
  await ensureSeeded()
  const bulan = req.nextUrl.searchParams.get('bulan') || ''
  const where = bulan ? { bulan } : {}
  const data = await prisma.observasiUmum.findMany({ where, orderBy: { id: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nomor, tanggal, namaPasien, harga, pembayaran, setor } = body

  // Calculate running total
  const bulan = getBulan(tanggal)
  const minggu = getMinggu(tanggal)
  const last = await prisma.observasiUmum.findFirst({ where: { bulan }, orderBy: { id: 'desc' } })
  const prevTotal = last ? last.total : 0
  const total = prevTotal + harga - (setor || 0)

  const record = await prisma.observasiUmum.create({
    data: { nomor, tanggal, namaPasien, harga, pembayaran, total, setor: setor || 0, bulan, minggu }
  })
  return NextResponse.json(record)
}
