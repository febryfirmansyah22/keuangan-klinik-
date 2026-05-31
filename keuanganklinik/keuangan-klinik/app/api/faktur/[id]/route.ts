import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBulan } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { nomor, tanggal, pbfToko, harga, keterangan } = body
  const bulan = getBulan(tanggal)
  const record = await prisma.fakturObat.update({
    where: { id: parseInt(id) },
    data: { nomor, tanggal, pbfToko, harga, keterangan, bulan }
  })
  return NextResponse.json(record)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.fakturObat.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
