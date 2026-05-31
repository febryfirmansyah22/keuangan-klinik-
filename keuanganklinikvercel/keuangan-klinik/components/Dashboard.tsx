'use client'

import { useEffect, useState, useRef } from 'react'

function formatRp(n: number) {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'rb'
  return 'Rp ' + n.toLocaleString('id-ID')
}

interface DashData {
  totalPasienObs: number
  totalBiayaObs: number
  totalQris: number
  totalCash: number
  totalPenjualanCream: number
  totalPengeluaranCream: number
  saldoCream: number
  saldoCreamCash: number
  saldoCreamTF: number
  totalFaktur: number
  pbfMap: Record<string, number>
  recent: Array<{
    id: number; tanggal: string; namaPasien: string; modul: string; pembayaran: string; nominal: number
  }>
}

export default function Dashboard({ bulan }: { bulan: string }) {
  const [data, setData] = useState<DashData | null>(null)
  const chartObsRef = useRef<HTMLCanvasElement>(null)
  const chartCreamRef = useRef<HTMLCanvasElement>(null)
  const chartPayRef = useRef<HTMLCanvasElement>(null)
  const chartsRef = useRef<unknown[]>([])

  useEffect(() => {
    fetch(`/api/dashboard?bulan=${bulan}`)
      .then(r => r.json())
      .then(setData)
  }, [bulan])

  useEffect(() => {
    if (!data) return
    chartsRef.current.forEach((c: unknown) => (c as { destroy(): void }).destroy())
    chartsRef.current = []

    import('chart.js/auto').then(({ default: Chart }) => {
      if (chartObsRef.current) {
        chartsRef.current.push(new Chart(chartObsRef.current, {
          type: 'bar',
          data: {
            labels: ['Cash','QRIS/TF'],
            datasets: [{ label: 'Nominal', data: [data.totalCash, data.totalQris], backgroundColor: ['#3b82f6','#8b5cf6'], borderRadius: 4 }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v: unknown) => 'Rp '+(Number(v)/1000)+'rb', font: { size: 10 } } } } }
        }))
      }
      if (chartCreamRef.current) {
        chartsRef.current.push(new Chart(chartCreamRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Penjualan','Pengeluaran'],
            datasets: [{ data: [data.totalPenjualanCream, data.totalPengeluaranCream], backgroundColor: ['#8b5cf6','#ef4444'], hoverOffset: 4 }]
          },
          options: { responsive: true, cutout: '65%', plugins: { legend: { labels: { font: { size: 10 } } } } }
        }))
      }
      if (chartPayRef.current) {
        const pbfLabels = Object.keys(data.pbfMap)
        const pbfValues = Object.values(data.pbfMap)
        chartsRef.current.push(new Chart(chartPayRef.current, {
          type: 'bar',
          data: {
            labels: pbfLabels,
            datasets: [{ label: 'Pembelian', data: pbfValues, backgroundColor: '#f97316', borderRadius: 4 }]
          },
          options: { indexAxis: 'y' as const, responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: (v: unknown) => 'Rp '+(Number(v)/1000)+'rb', font: { size: 10 } } } } }
        }))
      }
    })
    return () => { chartsRef.current.forEach((c: unknown) => (c as { destroy(): void }).destroy()) }
  }, [data])

  if (!data) return <div className="p-6 text-sm text-gray-500">Memuat data...</div>

  const badgeClass = (modul: string) => {
    if (modul === 'Obs Umum') return 'bg-blue-50 text-blue-700'
    if (modul === 'CREAM') return 'bg-purple-50 text-purple-700'
    return 'bg-orange-50 text-orange-700'
  }
  const bayarClass = (b: string) => {
    if (b === 'Cash') return 'bg-green-100 text-green-700'
    if (b === 'QRIS/TF' || b === 'TF') return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="p-6 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Pasien (Obs)', value: String(data.totalPasienObs), sub: bulan, color: 'bg-blue-50 border-blue-100', tc: 'text-blue-600', vc: 'text-blue-800', ic: 'bg-blue-100 text-blue-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { label: 'Pemasukan Obs', value: formatRp(data.totalBiayaObs), sub: bulan, color: 'bg-green-50 border-green-100', tc: 'text-green-600', vc: 'text-green-800', ic: 'bg-green-100 text-green-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Penjualan CREAM', value: formatRp(data.totalPenjualanCream), sub: bulan, color: 'bg-purple-50 border-purple-100', tc: 'text-purple-600', vc: 'text-purple-800', ic: 'bg-purple-100 text-purple-600', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
          { label: 'Pembelian Obat', value: formatRp(data.totalFaktur), sub: bulan, color: 'bg-orange-50 border-orange-100', tc: 'text-orange-600', vc: 'text-orange-800', ic: 'bg-orange-100 text-orange-600', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </div>
              <div className={`w-9 h-9 ${c.ic} rounded-lg flex items-center justify-center`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">Metode Bayar Obs Umum</p>
          <canvas ref={chartObsRef} height={160} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">CREAM: Penjualan vs Pengeluaran</p>
          <canvas ref={chartCreamRef} height={160} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">Pembelian per PBF/Toko</p>
          <canvas ref={chartPayRef} height={160} />
        </div>
      </div>

      {/* Recent + CREAM Saldo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Transaksi Terakhir</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium">Tanggal</th>
                <th className="text-left px-4 py-2.5 font-medium">Nama</th>
                <th className="text-left px-4 py-2.5 font-medium">Modul</th>
                <th className="text-left px-4 py-2.5 font-medium">Bayar</th>
                <th className="text-right px-4 py-2.5 font-medium">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recent.map(r => (
                <tr key={`${r.modul}-${r.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-500">{r.tanggal}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{r.namaPasien}</td>
                  <td className="px-4 py-2.5"><span className={`${badgeClass(r.modul)} px-2 py-0.5 rounded-full text-xs`}>{r.modul}</span></td>
                  <td className="px-4 py-2.5">
                    {r.pembayaran ? <span className={`${bayarClass(r.pembayaran)} px-2 py-0.5 rounded-full text-xs`}>{r.pembayaran}</span> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${r.nominal < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                    {r.nominal < 0 ? '-' : ''}Rp {Math.abs(r.nominal).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Saldo CREAM</h3>
            <p className="text-xs text-gray-400">{bulan}</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-center py-3">
              <p className="text-xs text-gray-500">Total Saldo</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatRp(data.saldoCream)}</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>Cash</div>
                <span className="font-semibold text-gray-800">{formatRp(data.saldoCreamCash)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>Transfer (TF)</div>
                <span className="font-semibold text-gray-800">{formatRp(data.saldoCreamTF)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Total Penjualan</span><span className="text-green-600 font-medium">{formatRp(data.totalPenjualanCream)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total Pengeluaran</span><span className="text-red-500 font-medium">-{formatRp(data.totalPengeluaranCream)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
