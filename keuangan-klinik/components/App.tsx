'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import ObsUmum from './ObsUmum'
import Cream from './Cream'
import FakturObat from './FakturObat'
import Rekap from './Rekap'
import FeeDokter from './FeeDokter'

type Page = 'dashboard' | 'obs' | 'cream' | 'faktur' | 'rekap' | 'feedokter'

const titles: Record<Page, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Ringkasan keuangan klinik' },
  obs: { title: 'Observasi Umum', sub: 'Input & rekap data observasi umum' },
  cream: { title: 'CREAM', sub: 'Input & rekap penjualan cream' },
  faktur: { title: 'Faktur Obat', sub: 'Input & rekap pembelian obat' },
  rekap: { title: 'Rekap & Grafik', sub: 'Grafik & laporan bulanan' },
  feedokter: { title: 'Fee Dokter', sub: 'Jadwal & kalkulasi fee dokter jaga' },
}

const MONTHS = ['2026-06','2026-05','2026-04','2026-03','2026-02','2026-01']
const monthLabel = (m: string) => {
  const [y, mo] = m.split('-')
  const names = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${names[parseInt(mo)]} ${y}`
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [bulan, setBulan] = useState('2026-06')

  const { title, sub } = titles[page]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={page} onNav={setPage} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulan}
              onChange={e => setBulan(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <button className="flex items-center gap-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Excel
            </button>
          </div>
        </header>

        {page === 'dashboard' && <Dashboard bulan={bulan} />}
        {page === 'obs' && <ObsUmum bulan={bulan} />}
        {page === 'cream' && <Cream bulan={bulan} />}
        {page === 'faktur' && <FakturObat bulan={bulan} />}
        {page === 'rekap' && <Rekap />}
        {page === 'feedokter' && <FeeDokter bulan={bulan} />}
      </main>
    </div>
  )
}
