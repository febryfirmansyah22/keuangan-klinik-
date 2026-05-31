import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { nomor, tanggal, namaPasien, penjualan, hargaJual, pengeluaran, keterangan } = body
  const bulan = getBulan(tanggal)
  const saldo = hargaJual - (pengeluaran || 0)
  const record = await prisma.cream.update({
    where: { id: parseInt(id) },
    data: { nomor, tanggal, namaPasien, penjualan, hargaJual, pengeluaran: pengeluaran || 0, keterangan, saldo, bulan }
  })
  return NextResponse.json(record)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.cream.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
