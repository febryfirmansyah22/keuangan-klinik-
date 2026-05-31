export function getBulan(tanggal: string): string {
  const d = new Date(tanggal)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getMinggu(tanggal: string): string {
  const d = new Date(tanggal)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

export function formatRp(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function bulanLabel(bulan: string): string {
  const [year, month] = bulan.split('-')
  const names = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${names[parseInt(month)]} ${year}`
}
