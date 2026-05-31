'use client'

import { useEffect, useState } from 'react'

interface CreamItem {
  id: number; nomor: number; tanggal: string; namaPasien: string
  penjualan: string; hargaJual: number; pengeluaran: number; keterangan: string; saldo: number
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function Cream({ bulan }: { bulan: string }) {
  const [data, setData] = useState<CreamItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<CreamItem | null>(null)
  const [form, setForm] = useState({ nomor:'', tanggal: new Date().toISOString().slice(0,10), namaPasien:'', penjualan:'', hargaJual:'', pengeluaran:'', keterangan:'' })
  const [loading, setLoading] = useState(false)

  const load = () => fetch(`/api/cream?bulan=${bulan}`).then(r => r.json()).then(setData)
  useEffect(() => { load() }, [bulan])

  const totalPasien = data.length
  const totalPenjualan = data.reduce((s,r) => s + r.hargaJual, 0)
  const totalPengeluaran = data.reduce((s,r) => s + r.pengeluaran, 0)
  const saldo = totalPenjualan - totalPengeluaran
  const saldoCash = data.filter(r=>r.keterangan==='Cash').reduce((s,r)=>s+r.hargaJual-r.pengeluaran,0)
  const saldoTF = data.filter(r=>r.keterangan==='TF').reduce((s,r)=>s+r.hargaJual-r.pengeluaran,0)

  const openAdd = () => {
    setEditItem(null)
    setForm({ nomor: String(data.length+1), tanggal: new Date().toISOString().slice(0,10), namaPasien:'', penjualan:'', hargaJual:'', pengeluaran:'', keterangan:'' })
    setShowForm(true)
  }
  const openEdit = (r: CreamItem) => {
    setEditItem(r)
    setForm({ nomor:String(r.nomor), tanggal:r.tanggal, namaPasien:r.namaPasien, penjualan:r.penjualan, hargaJual:String(r.hargaJual), pengeluaran:String(r.pengeluaran), keterangan:r.keterangan })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.namaPasien || !form.hargaJual || !form.keterangan) return alert('Lengkapi form!')
    setLoading(true)
    const body = { nomor:+form.nomor, tanggal:form.tanggal, namaPasien:form.namaPasien, penjualan:form.penjualan, hargaJual:+form.hargaJual, pengeluaran:+form.pengeluaran||0, keterangan:form.keterangan }
    if (editItem) await fetch(`/api/cream/${editItem.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    else await fetch('/api/cream', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setLoading(false); setShowForm(false); load()
  }

  const del = async (id: number) => {
    if (!confirm('Hapus data ini?')) return
    await fetch(`/api/cream/${id}`, { method:'DELETE' }); load()
  }

  const ketBadge = (k: string) => k === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100"><p className="text-xs text-purple-600 font-medium">Total Pasien</p><p className="text-xl font-bold text-purple-700 mt-0.5">{totalPasien}</p><p className="text-xs text-purple-500">{bulan}</p></div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100"><p className="text-xs text-green-600 font-medium">Total Penjualan</p><p className="text-xl font-bold text-green-700 mt-0.5">{formatRp(totalPenjualan)}</p><p className="text-xs text-green-500">{bulan}</p></div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100"><p className="text-xs text-red-600 font-medium">Total Pengeluaran</p><p className="text-xl font-bold text-red-700 mt-0.5">{formatRp(totalPengeluaran)}</p><p className="text-xs text-red-500">{bulan}</p></div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">Saldo</p>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{formatRp(saldo)}</p>
          <p className="text-xs text-gray-500">Cash: <b>{formatRp(saldoCash)}</b> · TF: <b>{formatRp(saldoTF)}</b></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Data CREAM — {bulan}</h3>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Tambah Data
          </button>
        </div>

        {showForm && (
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-3">{editItem ? 'Edit Data CREAM' : 'Form Input CREAM'}</p>
            <div className="grid grid-cols-6 gap-3">
              <div><label className="text-xs text-gray-600 mb-1 block">No.</label><input type="number" value={form.nomor} onChange={e=>setForm(p=>({...p,nomor:e.target.value}))} className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Tanggal</label><input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Nama Pasien</label><input type="text" value={form.namaPasien} onChange={e=>setForm(p=>({...p,namaPasien:e.target.value}))} placeholder="Nama..." className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Penjualan</label><input type="text" value={form.penjualan} onChange={e=>setForm(p=>({...p,penjualan:e.target.value}))} placeholder="Nama cream..." className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Harga Jual</label><input type="number" value={form.hargaJual} onChange={e=>setForm(p=>({...p,hargaJual:e.target.value}))} placeholder="0" className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Pengeluaran</label><input type="number" value={form.pengeluaran} onChange={e=>setForm(p=>({...p,pengeluaran:e.target.value}))} placeholder="0" className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/></div>
            </div>
            <div className="mt-2"><label className="text-xs text-gray-600 mb-1 block">Keterangan (Metode Bayar)</label>
              <select value={form.keterangan} onChange={e=>setForm(p=>({...p,keterangan:e.target.value}))} className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Pilih...</option><option>Cash</option><option>TF</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} disabled={loading} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setShowForm(false)} className="text-xs bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}

        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2.5 font-medium">No</th>
              <th className="text-left px-4 py-2.5 font-medium">Tanggal</th>
              <th className="text-left px-4 py-2.5 font-medium">Nama Pasien</th>
              <th className="text-left px-4 py-2.5 font-medium">Penjualan</th>
              <th className="text-right px-4 py-2.5 font-medium">Harga Jual</th>
              <th className="text-right px-4 py-2.5 font-medium">Pengeluaran</th>
              <th className="text-left px-4 py-2.5 font-medium">Ket.</th>
              <th className="text-right px-4 py-2.5 font-medium">Saldo</th>
              <th className="text-center px-4 py-2.5 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-500">{r.nomor}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.tanggal}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800">{r.namaPasien}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.penjualan}</td>
                <td className="px-4 py-2.5 text-right">{formatRp(r.hargaJual)}</td>
                <td className="px-4 py-2.5 text-right text-red-500">{r.pengeluaran ? formatRp(r.pengeluaran) : '—'}</td>
                <td className="px-4 py-2.5"><span className={`${ketBadge(r.keterangan)} px-2 py-0.5 rounded-full`}>{r.keterangan}</span></td>
                <td className="px-4 py-2.5 text-right font-medium text-green-700">{formatRp(r.saldo)}</td>
                <td className="px-4 py-2.5 text-center space-x-2">
                  <button onClick={() => openEdit(r)} className="text-purple-600 hover:underline">Edit</button>
                  <button onClick={() => del(r.id)} className="text-red-500 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-gray-700">TOTAL {bulan}</td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-green-700">{formatRp(totalPenjualan)}</td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-red-600">{formatRp(totalPengeluaran)}</td>
              <td></td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-blue-700">{formatRp(saldo)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
