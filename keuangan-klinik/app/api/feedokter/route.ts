import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const bulan = req.nextUrl.searchParams.get('bulan') || ''
  const dokter = req.nextUrl.searchParams.get('dokter') || ''
  const where: Record<string, string> = {}
  if (bulan) where.bulan = bulan
  if (dokter) where.namaDokter = dokter
  const data = await prisma.feeDokter.findMany({ where, orderBy: [{ tanggal: 'asc' }, { shift: 'asc' }] })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const record = await prisma.feeDokter.create({ data: body })
  return NextResponse.json(record)
}
