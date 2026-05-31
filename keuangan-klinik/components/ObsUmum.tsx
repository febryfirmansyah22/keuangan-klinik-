'use client'

import { useEffect, useState } from 'react'

interface Obs {
  id: number; nomor: number; tanggal: string; namaPasien: string
  harga: number; pembayaran: string; total: number; setor: number; minggu: string
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function ObsUmum({ bulan }: { bulan: string }) {
  const [data, setData] = useState<Obs[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Obs | null>(null)
  const [form, setForm] = useState({ nomor: '', tanggal: new Date().toISOString().slice(0,10), namaPasien: '', harga: '', pembayaran: '', setor: '' })
  const [tab, setTab] = useState<'input'|'rekap'>('input')
  const [loading, setLoading] = useState(false)

  const load = () => fetch(`/api/obs?bulan=${bulan}`).then(r => r.json()).then(setData)
  useEffect(() => { load() }, [bulan])

  const totalPasien = data.filter(r => r.namaPasien !== 'Setor').length
  const totalBiaya = data.filter(r => r.namaPasien !== 'Setor').reduce((s,r) => s + r.harga, 0)
  const totalQris = data.filter(r => r.pembayaran === 'QRIS/TF').reduce((s,r) => s + r.harga, 0)
  const totalCash = data.filter(r => r.pembayaran === 'Cash').reduce((s,r) => s + r.harga, 0)

  // Group by week
  const weeks: Record<string, Obs[]> = {}
  data.forEach(r => {
    if (!weeks[r.minggu]) weeks[r.minggu] = []
    weeks[r.minggu].push(r)
  })

  const openAdd = () => {
    setEditItem(null)
    const nextNo = (data.filter(r=>r.namaPasien!=='Setor').length + 1)
    setForm({ nomor: String(nextNo), tanggal: new Date().toISOString().slice(0,10), namaPasien: '', harga: '', pembayaran: '', setor: '' })
    setShowForm(true)
  }
  const openEdit = (r: Obs) => {
    setEditItem(r)
    setForm({ nomor: String(r.nomor), tanggal: r.tanggal, namaPasien: r.namaPasien, harga: String(r.harga), pembayaran: r.pembayaran, setor: String(r.setor) })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.namaPasien || !form.harga || !form.pembayaran) return alert('Lengkapi form!')
    setLoading(true)
    const body = { nomor: +form.nomor, tanggal: form.tanggal, namaPasien: form.namaPasien, harga: +form.harga, pembayaran: form.pembayaran, setor: +form.setor || 0 }
    if (editItem) {
      await fetch(`/api/obs/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/obs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setLoading(false); setShowForm(false); load()
  }

  const del = async (id: number) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/obs/${id}`, { method: 'DELETE' })
    load()
  }

  const badgeClass = (p: string) => p === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'

  return (
    <div className="p-6 space-y-4">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {(['input','rekap'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition-colors ${tab===t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'input' ? 'Input Data' : 'Rekap Mingguan'}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100"><p className="text-xs text-blue-600 font-medium">Total Pasien</p><p className="text-xl font-bold text-blue-700 mt-0.5">{totalPasien}</p><p className="text-xs text-blue-500">{bulan}</p></div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100"><p className="text-xs text-green-600 font-medium">Total Biaya</p><p className="text-xl font-bold text-green-700 mt-0.5">{formatRp(totalBiaya)}</p><p className="text-xs text-green-500">{bulan}</p></div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100"><p className="text-xs text-purple-600 font-medium">Total QRIS/TF</p><p className="text-xl font-bold text-purple-700 mt-0.5">{formatRp(totalQris)}</p><p className="text-xs text-purple-500">{bulan}</p></div>
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100"><p className="text-xs text-orange-600 font-medium">Total Cash</p><p className="text-xl font-bold text-orange-700 mt-0.5">{formatRp(totalCash)}</p><p className="text-xs text-orange-500">{bulan}</p></div>
      </div>

      {tab === 'input' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Data Observasi Umum — {bulan}</h3>
            <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Tambah Data
            </button>
          </div>

          {showForm && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-3">{editItem ? 'Edit Data' : 'Form Input Baru'}</p>
              <div className="grid grid-cols-6 gap-3">
                {[
                  { label:'No.', key:'nomor', type:'number', cls:'', ph:'' },
                  { label:'Hari/Tanggal', key:'tanggal', type:'date', cls:'', ph:'' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-600 mb-1 block">{f.label}</label>
                    <input type={f.type} value={(form as Record<string,string>)[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}
                      className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Nama Pasien</label>
                  <input type="text" value={form.namaPasien} onChange={e => setForm(p=>({...p,namaPasien:e.target.value}))} placeholder="Nama pasien..."
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Harga (Rp)</label>
                  <input type="number" value={form.harga} onChange={e => setForm(p=>({...p,harga:e.target.value}))} placeholder="50000"
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Pembayaran</label>
                  <select value={form.pembayaran} onChange={e => setForm(p=>({...p,pembayaran:e.target.value}))}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih...</option>
                    <option>Cash</option>
                    <option>QRIS/TF</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-3 mt-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Setor <span className="text-gray-400">(opsional)</span></label>
                  <input type="number" value={form.setor} onChange={e => setForm(p=>({...p,setor:e.target.value}))} placeholder="0"
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={save} disabled={loading} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => setShowForm(false)} className="text-xs bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Batal</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium">No</th>
                  <th className="text-left px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-2.5 font-medium">Nama Pasien</th>
                  <th className="text-right px-4 py-2.5 font-medium">Harga</th>
                  <th className="text-left px-4 py-2.5 font-medium">Pembayaran</th>
                  <th className="text-right px-4 py-2.5 font-medium">Total</th>
                  <th className="text-right px-4 py-2.5 font-medium">Setor</th>
                  <th className="text-center px-4 py-2.5 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50 ${r.namaPasien === 'Setor' ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-2.5 text-gray-500">{r.namaPasien !== 'Setor' ? r.nomor : '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.tanggal}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.namaPasien}</td>
                    <td className="px-4 py-2.5 text-right">{r.harga ? formatRp(r.harga) : '—'}</td>
                    <td className="px-4 py-2.5">
                      {r.pembayaran && r.pembayaran !== '-' ? <span className={`${badgeClass(r.pembayaran)} px-2 py-0.5 rounded-full`}>{r.pembayaran}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatRp(r.total)}</td>
                    <td className="px-4 py-2.5 text-right text-red-600 font-medium">{r.setor ? formatRp(r.setor) : '—'}</td>
                    <td className="px-4 py-2.5 text-center space-x-2">
                      <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => del(r.id)} className="text-red-500 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-700">TOTAL {bulan}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-800">{formatRp(totalBiaya)}</td>
                  <td></td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-green-700">{data.length ? formatRp(data[data.length-1].total) : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-red-600">{formatRp(data.reduce((s,r)=>s+r.setor,0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {tab === 'rekap' && (
        <div className="space-y-4">
          {Object.entries(weeks).sort().map(([week, rows]) => {
            const wPasien = rows.filter(r=>r.namaPasien!=='Setor').length
            const wBiaya = rows.filter(r=>r.namaPasien!=='Setor').reduce((s,r)=>s+r.harga,0)
            const wQris = rows.filter(r=>r.pembayaran==='QRIS/TF').reduce((s,r)=>s+r.harga,0)
            const wCash = rows.filter(r=>r.pembayaran==='Cash').reduce((s,r)=>s+r.harga,0)
            return (
              <div key={week} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-700">Minggu: {week}</h3>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Pasien: <b>{wPasien}</b></span>
                    <span>Biaya: <b>{formatRp(wBiaya)}</b></span>
                    <span>Cash: <b>{formatRp(wCash)}</b></span>
                    <span>QRIS/TF: <b>{formatRp(wQris)}</b></span>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 border-b bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium">No</th>
                    <th className="text-left px-4 py-2 font-medium">Tanggal</th>
                    <th className="text-left px-4 py-2 font-medium">Pasien</th>
                    <th className="text-right px-4 py-2 font-medium">Harga</th>
                    <th className="text-left px-4 py-2 font-medium">Bayar</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-500">{r.nomor || '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{r.tanggal}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{r.namaPasien}</td>
                        <td className="px-4 py-2 text-right">{r.harga ? formatRp(r.harga) : '—'}</td>
                        <td className="px-4 py-2">{r.pembayaran && r.pembayaran!=='-' ? <span className={`${badgeClass(r.pembayaran)} px-2 py-0.5 rounded-full`}>{r.pembayaran}</span> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
