import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bulanLabel } from '@/lib/utils'

export async function GET() {
  const [obsAll, creamAll, fakturAll] = await Promise.all([
    prisma.observasiUmum.findMany({ orderBy: { tanggal: 'asc' } }),
    prisma.cream.findMany({ orderBy: { tanggal: 'asc' } }),
    prisma.fakturObat.findMany({ orderBy: { tanggal: 'asc' } }),
  ])

  const bulanSet = new Set([
    ...obsAll.map(r => r.bulan),
    ...creamAll.map(r => r.bulan),
    ...fakturAll.map(r => r.bulan),
  ])
  const bulans = Array.from(bulanSet).sort()

  const labels = bulans.map(bulanLabel)
  const obsPasien = bulans.map(b => obsAll.filter(r => r.bulan === b && r.namaPasien !== 'Setor').length)
  const obsPemasukan = bulans.map(b => obsAll.filter(r => r.bulan === b).reduce((s,r) => s+r.harga, 0))
  const creamPenjualan = bulans.map(b => creamAll.filter(r => r.bulan === b).reduce((s,r) => s+r.hargaJual, 0))
  const creamPengeluaran = bulans.map(b => creamAll.filter(r => r.bulan === b).reduce((s,r) => s+r.pengeluaran, 0))
  const fakturTotal = bulans.map(b => fakturAll.filter(r => r.bulan === b).reduce((s,r) => s+r.harga, 0))

  return NextResponse.json({ labels, obsPasien, obsPemasukan, creamPenjualan, creamPengeluaran, fakturTotal })
}
