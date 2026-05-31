import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const bulan = req.nextUrl.searchParams.get('bulan') || new Date().toISOString().slice(0,7)

  const [obsData, creamData, fakturData] = await Promise.all([
    prisma.observasiUmum.findMany({ where: { bulan }, orderBy: { id: 'asc' } }),
    prisma.cream.findMany({ where: { bulan }, orderBy: { id: 'asc' } }),
    prisma.fakturObat.findMany({ where: { bulan }, orderBy: { id: 'asc' } }),
  ])

  const totalPasienObs = obsData.filter(r => r.namaPasien !== 'Setor').length
  const totalBiayaObs = obsData.reduce((s, r) => s + r.harga, 0)
  const totalQris = obsData.filter(r => r.pembayaran === 'QRIS/TF').reduce((s, r) => s + r.harga, 0)
  const totalCash = obsData.filter(r => r.pembayaran === 'Cash').reduce((s, r) => s + r.harga, 0)
  const totalPenjualanCream = creamData.reduce((s, r) => s + r.hargaJual, 0)
  const totalPengeluaranCream = creamData.reduce((s, r) => s + r.pengeluaran, 0)
  const saldoCream = totalPenjualanCream - totalPengeluaranCream
  const totalFaktur = fakturData.reduce((s, r) => s + r.harga, 0)

  // Recent transactions
  const recentObs = obsData.slice(-3).map(r => ({ ...r, modul: 'Obs Umum', nominal: r.harga }))
  const recentCream = creamData.slice(-2).map(r => ({ ...r, modul: 'CREAM', nominal: r.hargaJual, pembayaran: r.keterangan }))
  const recentFaktur = fakturData.slice(-2).map(r => ({ ...r, modul: 'Faktur Obat', nominal: -r.harga, namaPasien: r.pbfToko, pembayaran: '' }))
  const recent = [...recentObs, ...recentCream, ...recentFaktur]
    .sort((a, b) => b.id - a.id).slice(0, 7)

  // PBF breakdown
  const pbfMap: Record<string, number> = {}
  fakturData.forEach(r => { pbfMap[r.pbfToko] = (pbfMap[r.pbfToko] || 0) + r.harga })

  return NextResponse.json({
    totalPasienObs, totalBiayaObs, totalQris, totalCash,
    totalPenjualanCream, totalPengeluaranCream, saldoCream,
    totalFaktur, pbfMap, recent,
    saldoCreamCash: creamData.filter(r=>r.keterangan==='Cash').reduce((s,r)=>s+r.hargaJual-r.pengeluaran,0),
    saldoCreamTF: creamData.filter(r=>r.keterangan==='TF').reduce((s,r)=>s+r.hargaJual-r.pengeluaran,0),
  })
}
