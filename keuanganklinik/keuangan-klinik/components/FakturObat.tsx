'use client'

import { useEffect, useState } from 'react'

interface Faktur {
  id: number; nomor: number; tanggal: string; pbfToko: string; harga: number; keterangan: string
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function FakturObat({ bulan }: { bulan: string }) {
  const [data, setData] = useState<Faktur[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Faktur | null>(null)
  const [form, setForm] = useState({ nomor:'', tanggal: new Date().toISOString().slice(0,10), pbfToko:'', harga:'', keterangan:'' })
  const [loading, setLoading] = useState(false)

  const load = () => fetch(`/api/faktur?bulan=${bulan}`).then(r => r.json()).then(setData)
  useEffect(() => { load() }, [bulan])

  const totalFaktur = data.reduce((s,r) => s + r.harga, 0)
  const pbfMap: Record<string,number> = {}
  data.forEach(r => { pbfMap[r.pbfToko] = (pbfMap[r.pbfToko]||0) + r.harga })

  const openAdd = () => {
    setEditItem(null)
    setForm({ nomor: String(data.length+1), tanggal: new Date().toISOString().slice(0,10), pbfToko:'', harga:'', keterangan:'' })
    setShowForm(true)
  }
  const openEdit = (r: Faktur) => {
    setEditItem(r)
    setForm({ nomor:String(r.nomor), tanggal:r.tanggal, pbfToko:r.pbfToko, harga:String(r.harga), keterangan:r.keterangan })
    setShowForm(true)
  }
  const save = async () => {
    if (!form.pbfToko || !form.harga) return alert('Lengkapi form!')
    setLoading(true)
    const body = { nomor:+form.nomor, tanggal:form.tanggal, pbfToko:form.pbfToko, harga:+form.harga, keterangan:form.keterangan }
    if (editItem) await fetch(`/api/faktur/${editItem.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    else await fetch('/api/faktur', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setLoading(false); setShowForm(false); load()
  }
  const del = async (id: number) => {
    if (!confirm('Hapus faktur ini?')) return
    await fetch(`/api/faktur/${id}`, { method:'DELETE' }); load()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <p className="text-xs text-orange-600 font-medium">Total Pembelian Bulan Ini</p>
          <p className="text-xl font-bold text-orange-700 mt-0.5">{formatRp(totalFaktur)}</p>
          <p className="text-xs text-orange-500">{bulan} · {data.length} transaksi</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2">
          <p className="text-xs text-blue-600 font-medium mb-2">Per PBF / Toko</p>
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(pbfMap).map(([k,v]) => (
              <span key={k} className="text-gray-600">{k}: <b className="text-gray-800">{formatRp(v)}</b></span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Faktur Pembelian Obat — {bulan}</h3>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Tambah Faktur
          </button>
        </div>

        {showForm && (
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
            <p className="text-xs font-semibold text-orange-700 mb-3">{editItem ? 'Edit Faktur' : 'Form Input Faktur Obat'}</p>
            <div className="grid grid-cols-5 gap-3">
              <div><label className="text-xs text-gray-600 mb-1 block">No.</label><input type="number" value={form.nomor} onChange={e=>setForm(p=>({...p,nomor:e.target.value}))} className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Hari/Tanggal</label><input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">PBF / Toko</label><input type="text" value={form.pbfToko} onChange={e=>setForm(p=>({...p,pbfToko:e.target.value}))} placeholder="Nama PBF atau toko..." className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Harga (Rp)</label><input type="number" value={form.harga} onChange={e=>setForm(p=>({...p,harga:e.target.value}))} placeholder="0" className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Keterangan</label><input type="text" value={form.keterangan} onChange={e=>setForm(p=>({...p,keterangan:e.target.value}))} placeholder="Keterangan..." className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} disabled={loading} className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setShowForm(false)} className="text-xs bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}

        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2.5 font-medium">No</th>
              <th className="text-left px-4 py-2.5 font-medium">Hari/Tanggal</th>
              <th className="text-left px-4 py-2.5 font-medium">PBF / Toko</th>
              <th className="text-right px-4 py-2.5 font-medium">Harga</th>
              <th className="text-left px-4 py-2.5 font-medium">Keterangan</th>
              <th className="text-center px-4 py-2.5 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-500">{r.nomor}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.tanggal}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800">{r.pbfToko}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-800">{formatRp(r.harga)}</td>
                <td className="px-4 py-2.5 text-gray-500">{r.keterangan}</td>
                <td className="px-4 py-2.5 text-center space-x-2">
                  <button onClick={() => openEdit(r)} className="text-orange-600 hover:underline">Edit</button>
                  <button onClick={() => del(r.id)} className="text-red-500 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-700">TOTAL {bulan}</td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-orange-700">{formatRp(totalFaktur)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
