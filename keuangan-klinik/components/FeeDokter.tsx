'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatRp } from '@/lib/utils'
import * as XLSX from 'xlsx'

const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
const KETERANGAN_OPT = ['USG','Tindakan','GO','Surat Sehat','Cream','Lainnya']

const RATES = {
  shift: 100000,
  rjUmum: 10000, rjBpjs: 4000,
  obsUmum: 20000, obsBpjs: 20000,
  riUmum: 25000, riBpjs: 20000,
  visitUmum: 10000, visitBpjs: 8000,
  injeksi: 2000, ekg: 5000, nebulisasi: 5000,
  konsulRajal1: 5000, konsulRajal2: 10000, konsulRajal3: 15000,
  konsulObs1: 15000, konsulObs2: 20000,
  konsulRanap1: 20000, konsulRanap2: 25000,
}

interface FeeRow {
  id: number; namaDokter: string; hari: string; tanggal: string; shift: string; bulan: string
  rjUmum: number; rjBpjs: number; obsUmum: number; obsBpjs: number
  riUmum: number; riBpjs: number; visitUmum: number; visitBpjs: number
  lainLain: number; keterangan: string; keteranganLain: string
  injeksi: number; ekg: number; nebulisasi: number
  konsulRajal1: number; konsulRajal2: number; konsulRajal3: number
  konsulObs1: number; konsulObs2: number
  konsulRanap1: number; konsulRanap2: number
  feeLainnya: number; catatanFee: string
}

type FormData = Omit<FeeRow, 'id' | 'bulan'>

function emptyForm(): FormData {
  const today = new Date()
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  return {
    namaDokter: '', hari: days[today.getDay()],
    tanggal: today.toISOString().slice(0, 10), shift: 'Pagi',
    rjUmum: 0, rjBpjs: 0, obsUmum: 0, obsBpjs: 0,
    riUmum: 0, riBpjs: 0, visitUmum: 0, visitBpjs: 0,
    lainLain: 0, keterangan: '', keteranganLain: '',
    injeksi: 0, ekg: 0, nebulisasi: 0,
    konsulRajal1: 0, konsulRajal2: 0, konsulRajal3: 0,
    konsulObs1: 0, konsulObs2: 0,
    konsulRanap1: 0, konsulRanap2: 0,
    feeLainnya: 0, catatanFee: '',
  }
}

function calcTotalPasien(r: FormData | FeeRow) {
  return r.rjUmum + r.rjBpjs + r.obsUmum + r.obsBpjs + r.riUmum + r.riBpjs
    + r.visitUmum + r.visitBpjs + r.lainLain
    + r.konsulRajal1 + r.konsulRajal2 + r.konsulRajal3
    + r.konsulObs1 + r.konsulObs2 + r.konsulRanap1 + r.konsulRanap2
}

function calcFeeHarian(r: FormData | FeeRow) {
  return RATES.shift
    + r.rjUmum * RATES.rjUmum + r.rjBpjs * RATES.rjBpjs
    + r.obsUmum * RATES.obsUmum + r.obsBpjs * RATES.obsBpjs
    + r.riUmum * RATES.riUmum + r.riBpjs * RATES.riBpjs
    + r.visitUmum * RATES.visitUmum + r.visitBpjs * RATES.visitBpjs
    + r.injeksi * RATES.injeksi + r.ekg * RATES.ekg + r.nebulisasi * RATES.nebulisasi
    + r.konsulRajal1 * RATES.konsulRajal1 + r.konsulRajal2 * RATES.konsulRajal2 + r.konsulRajal3 * RATES.konsulRajal3
    + r.konsulObs1 * RATES.konsulObs1 + r.konsulObs2 * RATES.konsulObs2
    + r.konsulRanap1 * RATES.konsulRanap1 + r.konsulRanap2 * RATES.konsulRanap2
}

function calcTotalFee(r: FormData | FeeRow) {
  const feeHarian = calcFeeHarian(r)
  const total = feeHarian + r.feeLainnya
  const hasObsRanap = (r.obsUmum + r.obsBpjs + r.riUmum + r.riBpjs) > 0
  if (total < 180000) return hasObsRanap ? 200000 : 180000
  return total
}

function getBulan(tanggal: string) {
  return tanggal.slice(0, 7)
}

function numField(val: number, key: keyof FormData, setForm: (fn: (p: FormData) => FormData) => void, label: string) {
  return (
    <div key={key}>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type="number" min={0} value={val === 0 ? '' : val}
        onChange={e => setForm(p => ({ ...p, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
        placeholder="0"
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
      />
    </div>
  )
}

export default function FeeDokter({ bulan }: { bulan: string }) {
  const [data, setData] = useState<FeeRow[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<FeeRow | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [filterDokter, setFilterDokter] = useState('Semua')
  const [tab, setTab] = useState<'input' | 'rekap'>('input')

  const dokterList = Array.from(new Set(data.map(r => r.namaDokter))).sort()

  const load = useCallback(() => {
    fetch(`/api/feedokter?bulan=${bulan}`).then(r => r.json()).then(setData)
  }, [bulan])

  useEffect(() => { load() }, [load])

  const displayed = filterDokter === 'Semua' ? data : data.filter(r => r.namaDokter === filterDokter)

  const totalFeeAll = displayed.reduce((s, r) => s + calcTotalFee(r), 0)
  const totalShifts = displayed.length
  const totalPasienAll = displayed.reduce((s, r) => s + calcTotalPasien(r), 0)

  const openAdd = () => {
    setEditItem(null)
    const f = emptyForm()
    if (filterDokter !== 'Semua') f.namaDokter = filterDokter
    setForm(f)
    setShowForm(true)
  }

  const openEdit = (r: FeeRow) => {
    setEditItem(r)
    const { id: _id, bulan: _b, ...rest } = r
    setForm(rest)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.namaDokter) return alert('Nama dokter harus diisi!')
    if (!form.tanggal) return alert('Tanggal harus diisi!')
    setLoading(true)
    const body = { ...form, bulan: getBulan(form.tanggal) }
    if (editItem) {
      await fetch(`/api/feedokter/${editItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
    } else {
      await fetch('/api/feedokter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
    }
    setLoading(false); setShowForm(false); load()
  }

  const del = async (id: number) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/feedokter/${id}`, { method: 'DELETE' })
    load()
  }

  const exportExcel = () => {
    const rows = displayed.map((r, i) => ({
      'No': i + 1,
      'Nama Dokter': r.namaDokter,
      'Hari': r.hari,
      'Tanggal': r.tanggal,
      'Shift': r.shift,
      'RJ Umum': r.rjUmum,
      'RJ BPJS': r.rjBpjs,
      'Obs Umum': r.obsUmum,
      'Obs BPJS': r.obsBpjs,
      'RI Umum': r.riUmum,
      'RI BPJS': r.riBpjs,
      'Visit Umum': r.visitUmum,
      'Visit BPJS': r.visitBpjs,
      'Lain-lain': r.lainLain,
      'Keterangan': r.keterangan === 'Lainnya' ? r.keteranganLain : r.keterangan,
      'Total Pasien': calcTotalPasien(r),
      'Injeksi': r.injeksi,
      'EKG': r.ekg,
      'Nebulisasi': r.nebulisasi,
      'Konsul Rajal 1': r.konsulRajal1,
      'Konsul Rajal 2': r.konsulRajal2,
      'Konsul Rajal 3': r.konsulRajal3,
      'Konsul Obs 1': r.konsulObs1,
      'Konsul Obs 2': r.konsulObs2,
      'Konsul Ranap 1': r.konsulRanap1,
      'Konsul Ranap 2': r.konsulRanap2,
      'Fee Harian': calcFeeHarian(r),
      'Fee Lainnya': r.feeLainnya,
      'Catatan': r.catatanFee,
      'Total': calcFeeHarian(r) + r.feeLainnya,
      'Total Fee (Final)': calcTotalFee(r),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Dokter')
    const filename = `Fee_Dokter_${filterDokter === 'Semua' ? 'Semua' : filterDokter}_${bulan}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  const exportPDF = () => {
    window.print()
  }

  const feeHarian = calcFeeHarian(form)
  const totalForm = feeHarian + form.feeLainnya
  const hasObsRanapForm = (form.obsUmum + form.obsBpjs + form.riUmum + form.riBpjs) > 0
  const totalFeeForm = totalForm < 180000
    ? (hasObsRanapForm ? 200000 : 180000)
    : totalForm

  return (
    <div className="p-6 space-y-4">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 no-print">
        {(['input', 'rekap'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'input' ? 'Input Data' : 'Rekap per Dokter'}
          </button>
        ))}
      </div>

      {/* Filter & Actions */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Filter Dokter:</label>
          <select value={filterDokter} onChange={e => setFilterDokter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="Semua">Semua Dokter</option>
            {dokterList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Export PDF
          </button>
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">Total Shift</p>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{totalShifts}</p>
          <p className="text-xs text-blue-400">{bulan}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <p className="text-xs text-green-600 font-medium">Total Pasien</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">{totalPasienAll}</p>
          <p className="text-xs text-green-400">{bulan}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium">Total Fee</p>
          <p className="text-xl font-bold text-purple-700 mt-0.5">{formatRp(totalFeeAll)}</p>
          <p className="text-xs text-purple-400">{bulan}</p>
        </div>
      </div>

      {tab === 'input' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between no-print">
            <h3 className="text-sm font-semibold text-gray-900">
              Jadwal Dokter — {bulan} {filterDokter !== 'Semua' && `(${filterDokter})`}
            </h3>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Shift
            </button>
          </div>

          {/* Input Form */}
          {showForm && (
            <div className="px-4 py-4 bg-blue-50 border-b border-blue-100 no-print">
              <p className="text-xs font-semibold text-blue-700 mb-4">{editItem ? 'Edit Data Shift' : 'Form Input Shift Baru'}</p>

              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Nama Dokter *</label>
                  <input list="dokter-list" type="text" value={form.namaDokter}
                    onChange={e => setForm(p => ({ ...p, namaDokter: e.target.value }))}
                    placeholder="Nama dokter..."
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <datalist id="dokter-list">
                    {dokterList.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Hari</label>
                  <select value={form.hari} onChange={e => setForm(p => ({ ...p, hari: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {HARI.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Tanggal</label>
                  <input type="date" value={form.tanggal}
                    onChange={e => {
                      const d = new Date(e.target.value)
                      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
                      setForm(p => ({ ...p, tanggal: e.target.value, hari: days[d.getDay()] }))
                    }}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Shift</label>
                  <select value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Pagi</option>
                    <option>Sore</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Patient Counts */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Jumlah Pasien</p>
                <div className="grid grid-cols-8 gap-2">
                  {numField(form.rjUmum, 'rjUmum', setForm, 'RJ Umum')}
                  {numField(form.rjBpjs, 'rjBpjs', setForm, 'RJ BPJS')}
                  {numField(form.obsUmum, 'obsUmum', setForm, 'Obs Umum')}
                  {numField(form.obsBpjs, 'obsBpjs', setForm, 'Obs BPJS')}
                  {numField(form.riUmum, 'riUmum', setForm, 'RI Umum')}
                  {numField(form.riBpjs, 'riBpjs', setForm, 'RI BPJS')}
                  {numField(form.visitUmum, 'visitUmum', setForm, 'Visit Umum')}
                  {numField(form.visitBpjs, 'visitBpjs', setForm, 'Visit BPJS')}
                </div>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {numField(form.lainLain, 'lainLain', setForm, 'Lain-lain')}
                  <div className="col-span-3">
                    <label className="text-xs text-gray-500 mb-1 block">Keterangan</label>
                    <select value={form.keterangan} onChange={e => setForm(p => ({ ...p, keterangan: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">— Pilih —</option>
                      {KETERANGAN_OPT.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  {form.keterangan === 'Lainnya' && (
                    <div className="col-span-4">
                      <label className="text-xs text-gray-500 mb-1 block">Keterangan Manual</label>
                      <input type="text" value={form.keteranganLain}
                        onChange={e => setForm(p => ({ ...p, keteranganLain: e.target.value }))}
                        placeholder="Tulis keterangan..."
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Tindakan Pendukung */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Tindakan Pendukung</p>
                <div className="grid grid-cols-6 gap-2">
                  {numField(form.injeksi, 'injeksi', setForm, 'Injeksi (Rp2rb)')}
                  {numField(form.ekg, 'ekg', setForm, 'EKG (Rp5rb)')}
                  {numField(form.nebulisasi, 'nebulisasi', setForm, 'Nebulisasi (Rp5rb)')}
                </div>
              </div>

              {/* Row 4: Konsul */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Konsultasi</p>
                <div className="grid grid-cols-8 gap-2">
                  {numField(form.konsulRajal1, 'konsulRajal1', setForm, 'Rajal 1 <21:00')}
                  {numField(form.konsulRajal2, 'konsulRajal2', setForm, 'Rajal 2 >21:00')}
                  {numField(form.konsulRajal3, 'konsulRajal3', setForm, 'Rajal 3 >24:00')}
                  {numField(form.konsulObs1, 'konsulObs1', setForm, 'Obs 1 <21:00')}
                  {numField(form.konsulObs2, 'konsulObs2', setForm, 'Obs 2 >21:00')}
                  {numField(form.konsulRanap1, 'konsulRanap1', setForm, 'Ranap 1 <24:00')}
                  {numField(form.konsulRanap2, 'konsulRanap2', setForm, 'Ranap 2 >24:00')}
                </div>
              </div>

              {/* Row 5: Fee Lainnya */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Fee Tambahan</p>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Fee Lainnya (Rp)</label>
                    <input type="number" min={0} value={form.feeLainnya === 0 ? '' : form.feeLainnya}
                      onChange={e => setForm(p => ({ ...p, feeLainnya: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-500 mb-1 block">Catatan</label>
                    <input type="text" value={form.catatanFee}
                      onChange={e => setForm(p => ({ ...p, catatanFee: e.target.value }))}
                      placeholder="Catatan fee..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              </div>

              {/* Fee Preview */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-yellow-700 mb-2">Kalkulasi Fee</p>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-gray-500">Fee Shift:</span> <b>{formatRp(RATES.shift)}</b></div>
                  <div><span className="text-gray-500">Fee Harian:</span> <b>{formatRp(feeHarian)}</b></div>
                  <div><span className="text-gray-500">Total:</span> <b>{formatRp(totalForm)}</b></div>
                  <div>
                    <span className="text-gray-500">Total Fee Final:</span>
                    <b className={totalFeeForm > totalForm ? 'text-green-700' : 'text-gray-800'}> {formatRp(totalFeeForm)}</b>
                    {totalFeeForm > totalForm && <span className="ml-1 text-green-600">(garansi)</span>}
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Total Pasien: {calcTotalPasien(form)} |
                  {totalForm < 180000 && hasObsRanapForm && ' Garansi 200rb (ada obs/ranap)'}
                  {totalForm < 180000 && !hasObsRanapForm && ' Garansi 180rb (tanpa obs/ranap)'}
                  {totalForm >= 180000 && ' Fee sesuai perhitungan'}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={save} disabled={loading}
                  className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="text-xs bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-max">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <th className="px-3 py-2.5 text-left font-medium sticky left-0 bg-gray-50">No</th>
                  <th className="px-3 py-2.5 text-left font-medium">Dokter</th>
                  <th className="px-3 py-2.5 text-left font-medium">Hari</th>
                  <th className="px-3 py-2.5 text-left font-medium">Tanggal</th>
                  <th className="px-3 py-2.5 text-center font-medium">Shift</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-blue-50" colSpan={2}>Rawat Jalan</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-green-50" colSpan={2}>Observasi</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-purple-50" colSpan={2}>Rawat Inap</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-orange-50" colSpan={2}>Visit</th>
                  <th className="px-3 py-2.5 text-center font-medium">Lain</th>
                  <th className="px-3 py-2.5 text-center font-medium">Ket</th>
                  <th className="px-3 py-2.5 text-center font-medium">Tot Pasien</th>
                  <th className="px-3 py-2.5 text-center font-medium">Injeksi</th>
                  <th className="px-3 py-2.5 text-center font-medium">EKG</th>
                  <th className="px-3 py-2.5 text-center font-medium">Nebul</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-yellow-50" colSpan={3}>Konsul Rajal</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-pink-50" colSpan={2}>Konsul Obs</th>
                  <th className="px-3 py-2.5 text-center font-medium bg-indigo-50" colSpan={2}>Konsul Ranap</th>
                  <th className="px-3 py-2.5 text-right font-medium">Fee Harian</th>
                  <th className="px-3 py-2.5 text-right font-medium">Fee Lain</th>
                  <th className="px-3 py-2.5 text-center font-medium">Catatan</th>
                  <th className="px-3 py-2.5 text-right font-medium">Total</th>
                  <th className="px-3 py-2.5 text-right font-medium text-blue-700">Total Fee</th>
                  <th className="px-3 py-2.5 text-center font-medium no-print">Aksi</th>
                </tr>
                <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 text-center">
                  <th colSpan={5} />
                  <th className="px-2 py-1 bg-blue-50 font-normal text-blue-500">Umum</th>
                  <th className="px-2 py-1 bg-blue-50 font-normal text-blue-500">BPJS</th>
                  <th className="px-2 py-1 bg-green-50 font-normal text-green-500">Umum</th>
                  <th className="px-2 py-1 bg-green-50 font-normal text-green-500">BPJS</th>
                  <th className="px-2 py-1 bg-purple-50 font-normal text-purple-500">Umum</th>
                  <th className="px-2 py-1 bg-purple-50 font-normal text-purple-500">BPJS</th>
                  <th className="px-2 py-1 bg-orange-50 font-normal text-orange-500">Umum</th>
                  <th className="px-2 py-1 bg-orange-50 font-normal text-orange-500">BPJS</th>
                  <th colSpan={4} />
                  <th className="px-2 py-1 bg-yellow-50 font-normal text-yellow-600">&lt;21</th>
                  <th className="px-2 py-1 bg-yellow-50 font-normal text-yellow-600">&gt;21</th>
                  <th className="px-2 py-1 bg-yellow-50 font-normal text-yellow-600">&gt;24</th>
                  <th className="px-2 py-1 bg-pink-50 font-normal text-pink-500">&lt;21</th>
                  <th className="px-2 py-1 bg-pink-50 font-normal text-pink-500">&gt;21</th>
                  <th className="px-2 py-1 bg-indigo-50 font-normal text-indigo-500">&lt;24</th>
                  <th className="px-2 py-1 bg-indigo-50 font-normal text-indigo-500">&gt;24</th>
                  <th colSpan={5} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.length === 0 && (
                  <tr><td colSpan={32} className="text-center py-8 text-gray-400">Belum ada data. Klik "Tambah Shift" untuk mulai input.</td></tr>
                )}
                {displayed.map((r, i) => {
                  const fh = calcFeeHarian(r)
                  const tot = fh + r.feeLainnya
                  const totFee = calcTotalFee(r)
                  const isGuaranty = totFee > tot
                  const ket = r.keterangan === 'Lainnya' ? r.keteranganLain : r.keterangan
                  return (
                    <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 text-gray-400 sticky left-0 bg-white">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{r.namaDokter}</td>
                      <td className="px-3 py-2 text-gray-600">{r.hari}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.tanggal}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.shift === 'Pagi' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                          {r.shift}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">{r.rjUmum || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.rjBpjs || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.obsUmum || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.obsBpjs || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.riUmum || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.riBpjs || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.visitUmum || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.visitBpjs || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.lainLain || '—'}</td>
                      <td className="px-3 py-2 text-center text-gray-500 max-w-20 truncate" title={ket}>{ket || '—'}</td>
                      <td className="px-3 py-2 text-center font-semibold text-gray-700">{calcTotalPasien(r)}</td>
                      <td className="px-3 py-2 text-center">{r.injeksi || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.ekg || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.nebulisasi || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulRajal1 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulRajal2 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulRajal3 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulObs1 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulObs2 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulRanap1 || '—'}</td>
                      <td className="px-3 py-2 text-center">{r.konsulRanap2 || '—'}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-700">{formatRp(fh)}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{r.feeLainnya ? formatRp(r.feeLainnya) : '—'}</td>
                      <td className="px-3 py-2 text-center text-gray-500 max-w-20 truncate" title={r.catatanFee}>{r.catatanFee || '—'}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatRp(tot)}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        <span className={isGuaranty ? 'text-green-700' : 'text-gray-800'}>{formatRp(totFee)}</span>
                        {isGuaranty && <span className="ml-1 text-green-500 text-xs">G</span>}
                      </td>
                      <td className="px-3 py-2 text-center space-x-2 no-print">
                        <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => del(r.id)} className="text-red-500 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {displayed.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-gray-700">
                  <tr>
                    <td colSpan={4} className="px-3 py-2.5 text-xs">TOTAL — {displayed.length} shift</td>
                    <td />
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.rjUmum,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.rjBpjs,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.obsUmum,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.obsBpjs,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.riUmum,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.riBpjs,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.visitUmum,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.visitBpjs,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.lainLain,0)}</td>
                    <td />
                    <td className="px-3 py-2.5 text-center text-xs">{totalPasienAll}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.injeksi,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.ekg,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.nebulisasi,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulRajal1,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulRajal2,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulRajal3,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulObs1,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulObs2,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulRanap1,0)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{displayed.reduce((s,r)=>s+r.konsulRanap2,0)}</td>
                    <td className="px-3 py-2.5 text-right text-xs">{formatRp(displayed.reduce((s,r)=>s+calcFeeHarian(r),0))}</td>
                    <td className="px-3 py-2.5 text-right text-xs">{formatRp(displayed.reduce((s,r)=>s+r.feeLainnya,0))}</td>
                    <td />
                    <td className="px-3 py-2.5 text-right text-xs">{formatRp(displayed.reduce((s,r)=>s+calcFeeHarian(r)+r.feeLainnya,0))}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-blue-700">{formatRp(totalFeeAll)}</td>
                    <td className="no-print" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {tab === 'rekap' && (
        <div className="space-y-4">
          {dokterList.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              Belum ada data untuk bulan {bulan}.
            </div>
          )}
          {dokterList.map(dokter => {
            const rows = data.filter(r => r.namaDokter === dokter)
            const totalShift = rows.length
            const totalPasien = rows.reduce((s, r) => s + calcTotalPasien(r), 0)
            const totalFeeHarian = rows.reduce((s, r) => s + calcFeeHarian(r), 0)
            const totalFeeL = rows.reduce((s, r) => s + r.feeLainnya, 0)
            const totalFee = rows.reduce((s, r) => s + calcTotalFee(r), 0)
            const rjTotal = rows.reduce((s,r)=>s+r.rjUmum+r.rjBpjs,0)
            const obsTotal = rows.reduce((s,r)=>s+r.obsUmum+r.obsBpjs,0)
            const riTotal = rows.reduce((s,r)=>s+r.riUmum+r.riBpjs,0)

            return (
              <div key={dokter} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">dr. {dokter}</h3>
                    <p className="text-xs text-blue-100">{bulan} — {totalShift} shift</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-100">Total Fee</p>
                    <p className="text-base font-bold text-white">{formatRp(totalFee)}</p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-5 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-blue-600">Rawat Jalan</p>
                    <p className="text-lg font-bold text-blue-700">{rjTotal}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-green-600">Observasi</p>
                    <p className="text-lg font-bold text-green-700">{obsTotal}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-purple-600">Rawat Inap</p>
                    <p className="text-lg font-bold text-purple-700">{riTotal}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-orange-600">Total Pasien</p>
                    <p className="text-lg font-bold text-orange-700">{totalPasien}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500">Fee Harian Total</p>
                    <p className="text-lg font-bold text-gray-700">{formatRp(totalFeeHarian)}</p>
                  </div>
                </div>

                <table className="w-full text-xs border-t border-gray-100">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">Tanggal</th>
                      <th className="px-3 py-2 text-center font-medium">Shift</th>
                      <th className="px-3 py-2 text-center font-medium">Pasien</th>
                      <th className="px-3 py-2 text-center font-medium">RJ</th>
                      <th className="px-3 py-2 text-center font-medium">Obs</th>
                      <th className="px-3 py-2 text-center font-medium">RI</th>
                      <th className="px-3 py-2 text-right font-medium">Fee Harian</th>
                      <th className="px-3 py-2 text-right font-medium">Fee Lain</th>
                      <th className="px-3 py-2 text-right font-medium text-blue-700">Total Fee</th>
                      <th className="px-3 py-2 text-center font-medium">Ket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map(r => {
                      const fh = calcFeeHarian(r)
                      const totFee = calcTotalFee(r)
                      const isG = totFee > fh + r.feeLainnya
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{r.hari}, {r.tanggal}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full ${r.shift === 'Pagi' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                              {r.shift}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-medium">{calcTotalPasien(r)}</td>
                          <td className="px-3 py-2 text-center">{r.rjUmum + r.rjBpjs}</td>
                          <td className="px-3 py-2 text-center">{r.obsUmum + r.obsBpjs}</td>
                          <td className="px-3 py-2 text-center">{r.riUmum + r.riBpjs}</td>
                          <td className="px-3 py-2 text-right">{formatRp(fh)}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{r.feeLainnya ? formatRp(r.feeLainnya) : '—'}</td>
                          <td className="px-3 py-2 text-right font-semibold">
                            <span className={isG ? 'text-green-700' : 'text-gray-800'}>{formatRp(totFee)}</span>
                            {isG && <span className="ml-1 text-green-400 text-xs">G</span>}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-500">{r.keterangan === 'Lainnya' ? r.keteranganLain : r.keterangan || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={2} className="px-3 py-2.5 text-xs font-semibold text-gray-700">TOTAL {totalShift} shift</td>
                      <td className="px-3 py-2.5 text-center text-xs font-bold">{totalPasien}</td>
                      <td className="px-3 py-2.5 text-center text-xs font-bold">{rjTotal}</td>
                      <td className="px-3 py-2.5 text-center text-xs font-bold">{obsTotal}</td>
                      <td className="px-3 py-2.5 text-center text-xs font-bold">{riTotal}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold">{formatRp(totalFeeHarian)}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold">{formatRp(totalFeeL)}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold text-blue-700">{formatRp(totalFee)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          })}
        </div>
      )}

      {/* Fee Rate Reference */}
      <details className="bg-gray-50 rounded-xl border border-gray-200 no-print">
        <summary className="px-4 py-3 text-xs font-semibold text-gray-600 cursor-pointer">Referensi Tarif Fee Dokter</summary>
        <div className="px-4 pb-4 grid grid-cols-4 gap-2 text-xs text-gray-600">
          <div><b>Shift Pagi/Sore:</b> {formatRp(RATES.shift)}</div>
          <div><b>RJ Umum:</b> {formatRp(RATES.rjUmum)}/pasien</div>
          <div><b>RJ BPJS:</b> {formatRp(RATES.rjBpjs)}/pasien</div>
          <div><b>Obs Umum:</b> {formatRp(RATES.obsUmum)}/pasien</div>
          <div><b>Obs BPJS:</b> {formatRp(RATES.obsBpjs)}/pasien</div>
          <div><b>RI Umum:</b> {formatRp(RATES.riUmum)}/pasien</div>
          <div><b>RI BPJS:</b> {formatRp(RATES.riBpjs)}/pasien</div>
          <div><b>Visit Umum:</b> {formatRp(RATES.visitUmum)}/pasien</div>
          <div><b>Visit BPJS:</b> {formatRp(RATES.visitBpjs)}/pasien</div>
          <div><b>Injeksi:</b> {formatRp(RATES.injeksi)}/tindakan</div>
          <div><b>EKG:</b> {formatRp(RATES.ekg)}/tindakan</div>
          <div><b>Nebulisasi:</b> {formatRp(RATES.nebulisasi)}/tindakan</div>
          <div><b>Konsul Rajal 1:</b> {formatRp(RATES.konsulRajal1)}</div>
          <div><b>Konsul Rajal 2:</b> {formatRp(RATES.konsulRajal2)}</div>
          <div><b>Konsul Rajal 3:</b> {formatRp(RATES.konsulRajal3)}</div>
          <div><b>Konsul Obs 1:</b> {formatRp(RATES.konsulObs1)}</div>
          <div><b>Konsul Obs 2:</b> {formatRp(RATES.konsulObs2)}</div>
          <div><b>Konsul Ranap 1:</b> {formatRp(RATES.konsulRanap1)}</div>
          <div><b>Konsul Ranap 2:</b> {formatRp(RATES.konsulRanap2)}</div>
          <div className="col-span-4 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <b>Garansi Fee:</b> Jika total &lt; Rp180rb → garansi Rp180rb (tanpa obs/ranap) atau Rp200rb (ada obs/ranap). Jika ≥ Rp200rb → fee sesuai perhitungan.
          </div>
        </div>
      </details>
    </div>
  )
}
