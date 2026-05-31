import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan } from '@/lib/utils'
import { ensureSeeded } from '@/lib/seed'

export async function GET(req: NextRequest) {
  await ensureSeeded()
  const bulan = req.nextUrl.searchParams.get('bulan') || ''
  const where = bulan ? { bulan } : {}
  const data = await prisma.cream.findMany({ where, orderBy: { id: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nomor, tanggal, namaPasien, penjualan, hargaJual, pengeluaran, keterangan } = body
  const bulan = getBulan(tanggal)
  const last = await prisma.cream.findFirst({ where: { bulan }, orderBy: { id: 'desc' } })
  const prevSaldo = last ? last.saldo : 0
  const saldo = prevSaldo + hargaJual - (pengeluaran || 0)
  const record = await prisma.cream.create({
    data: { nomor, tanggal, namaPasien, penjualan, hargaJual, pengeluaran: pengeluaran || 0, keterangan, saldo, bulan }
  })
  return NextResponse.json(record)
}
