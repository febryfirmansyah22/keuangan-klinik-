import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan, getMinggu } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { nomor, tanggal, namaPasien, harga, pembayaran, setor } = body
  const bulan = getBulan(tanggal)
  const minggu = getMinggu(tanggal)
  const record = await prisma.observasiUmum.update({
    where: { id: parseInt(id) },
    data: { nomor, tanggal, namaPasien, harga, pembayaran, setor: setor || 0, bulan, minggu, total: harga - (setor || 0) }
  })
  return NextResponse.json(record)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.observasiUmum.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
