'use client'

import { useEffect, useState, useRef } from 'react'

interface RekapData {
  labels: string[]
  obsPasien: number[]
  obsPemasukan: number[]
  creamPenjualan: number[]
  creamPengeluaran: number[]
  fakturTotal: number[]
}

export default function Rekap() {
  const [data, setData] = useState<RekapData | null>(null)
  const chart1Ref = useRef<HTMLCanvasElement>(null)
  const chart2Ref = useRef<HTMLCanvasElement>(null)
  const chart3Ref = useRef<HTMLCanvasElement>(null)
  const chartsRef = useRef<unknown[]>([])

  useEffect(() => {
    fetch('/api/rekap').then(r => r.json()).then(setData)
  }, [])

  useEffect(() => {
    if (!data || !data.labels.length) return
    chartsRef.current.forEach((c: unknown) => (c as { destroy(): void }).destroy())
    chartsRef.current = []

    import('chart.js/auto').then(({ default: Chart }) => {
      if (chart1Ref.current) {
        chartsRef.current.push(new Chart(chart1Ref.current, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{ label: 'Jumlah Pasien', data: data.obsPasien, backgroundColor: '#3b82f6', borderRadius: 4 }]
          },
          options: { responsive: true, plugins: { legend: { labels: { font: { size: 10 } } } }, scales: { y: { ticks: { font: { size: 10 } } } } }
        }))
      }
      if (chart2Ref.current) {
        chartsRef.current.push(new Chart(chart2Ref.current, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{ label: 'Pembelian (Rp)', data: data.fakturTotal, backgroundColor: '#f97316', borderRadius: 4 }]
          },
          options: { responsive: true, plugins: { legend: { labels: { font: { size: 10 } } } }, scales: { y: { ticks: { font: { size: 10 }, callback: (v: unknown) => 'Rp '+(Number(v)/1000000).toFixed(1)+'jt' } } } }
        }))
      }
      if (chart3Ref.current) {
        chartsRef.current.push(new Chart(chart3Ref.current, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [
              { label: 'Penjualan CREAM', data: data.creamPenjualan, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4 },
              { label: 'Pengeluaran CREAM', data: data.creamPengeluaran, borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.4 },
            ]
          },
          options: { responsive: true, plugins: { legend: { labels: { font: { size: 10 } } } }, scales: { y: { ticks: { font: { size: 10 }, callback: (v: unknown) => 'Rp '+(Number(v)/1000000).toFixed(1)+'jt' } } } }
        }))
      }
    })
    return () => { chartsRef.current.forEach((c: unknown) => (c as { destroy(): void }).destroy()) }
  }, [data])

  if (!data) return <div className="p-6 text-sm text-gray-500">Memuat data...</div>
  if (!data.labels.length) return <div className="p-6 text-sm text-gray-500">Belum ada data untuk ditampilkan.</div>

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Pasien Obs Umum per Bulan</p>
          <canvas ref={chart1Ref} height={200} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Pembelian Obat per Bulan</p>
          <canvas ref={chart2Ref} height={200} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900 mb-4">Penjualan CREAM vs Pengeluaran</p>
        <canvas ref={chart3Ref} height={120} />
      </div>
    </div>
  )
}
