import { prisma } from './prisma'

let seedingDone = false
let seedingPromise: Promise<void> | null = null

// Isi data contoh sekali saja kalau database masih kosong.
// Idempotent: aman dipanggil di setiap request.
export async function ensureSeeded() {
  if (seedingDone) return
  if (seedingPromise) return seedingPromise

  seedingPromise = (async () => {
    const count = await prisma.observasiUmum.count()
    if (count > 0) {
      seedingDone = true
      return
    }

    // ---- Observasi Umum (Mei 2026) ----
    const obsData = [
      { nomor: 1, tanggal: '2026-05-05', namaPasien: 'Ahmad Fauzi', harga: 50000, pembayaran: 'Cash', minggu: '2026-04-27' },
      { nomor: 2, tanggal: '2026-05-05', namaPasien: 'Budi Santoso', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-04-27' },
      { nomor: 3, tanggal: '2026-05-06', namaPasien: 'Siti Rahayu', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-04' },
      { nomor: 4, tanggal: '2026-05-07', namaPasien: 'Dewi Lestari', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-05-04' },
      { nomor: 5, tanggal: '2026-05-08', namaPasien: 'Rizky Pratama', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-04' },
      { nomor: 6, tanggal: '2026-05-12', namaPasien: 'Rina Susanti', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-11' },
      { nomor: 7, tanggal: '2026-05-13', namaPasien: 'Maya Putri', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-05-11' },
      { nomor: 8, tanggal: '2026-05-14', namaPasien: 'Lina Wati', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-11' },
      { nomor: 9, tanggal: '2026-05-19', namaPasien: 'Hendra Kusuma', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-05-18' },
      { nomor: 10, tanggal: '2026-05-20', namaPasien: 'Fitri Andini', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-18' },
      { nomor: 11, tanggal: '2026-05-21', namaPasien: 'Wahyu Hidayat', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-18' },
      { nomor: 12, tanggal: '2026-05-26', namaPasien: 'Nurul Aisyah', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-05-25' },
      { nomor: 13, tanggal: '2026-05-27', namaPasien: 'Doni Setiawan', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-25' },
      { nomor: 14, tanggal: '2026-05-28', namaPasien: 'Yuni Kartika', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-25' },
      { nomor: 15, tanggal: '2026-05-29', namaPasien: 'Bagas Aditya', harga: 50000, pembayaran: 'QRIS/TF', minggu: '2026-05-25' },
      { nomor: 16, tanggal: '2026-05-30', namaPasien: 'Sari Indah', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-25' },
      { nomor: 17, tanggal: '2026-05-31', namaPasien: 'Tono Wibowo', harga: 50000, pembayaran: 'Cash', minggu: '2026-05-25' },
    ]
    let runningTotal = 0
    for (const o of obsData) {
      runningTotal += o.harga
      await prisma.observasiUmum.create({ data: { ...o, bulan: '2026-05', total: runningTotal, setor: 0 } })
    }
    await prisma.observasiUmum.create({
      data: { nomor: 0, tanggal: '2026-05-09', namaPasien: 'Setor', harga: 0, pembayaran: '-', total: runningTotal - 150000, setor: 150000, bulan: '2026-05', minggu: '2026-05-04' },
    })

    // ---- CREAM ----
    const creamData = [
      { nomor: 1, tanggal: '2026-05-02', namaPasien: 'Rina Susanti', penjualan: 'Cream Whitening', hargaJual: 200000, pengeluaran: 0, keterangan: 'Cash' },
      { nomor: 2, tanggal: '2026-05-05', namaPasien: 'Maya Putri', penjualan: 'Cream AHA', hargaJual: 175000, pengeluaran: 50000, keterangan: 'TF' },
      { nomor: 3, tanggal: '2026-05-08', namaPasien: 'Lina Wati', penjualan: 'Serum Vit C', hargaJual: 250000, pengeluaran: 0, keterangan: 'TF' },
      { nomor: 4, tanggal: '2026-05-12', namaPasien: 'Dewi Lestari', penjualan: 'Cream Retinol', hargaJual: 300000, pengeluaran: 75000, keterangan: 'Cash' },
      { nomor: 5, tanggal: '2026-05-15', namaPasien: 'Siti Rahayu', penjualan: 'Cream SPF', hargaJual: 150000, pengeluaran: 0, keterangan: 'Cash' },
      { nomor: 6, tanggal: '2026-05-19', namaPasien: 'Nurul Aisyah', penjualan: 'Cream Acne', hargaJual: 180000, pengeluaran: 30000, keterangan: 'TF' },
      { nomor: 7, tanggal: '2026-05-22', namaPasien: 'Fitri Andini', penjualan: 'Serum HA', hargaJual: 220000, pengeluaran: 0, keterangan: 'Cash' },
      { nomor: 8, tanggal: '2026-05-26', namaPasien: 'Yuni Kartika', penjualan: 'Cream Night', hargaJual: 275000, pengeluaran: 100000, keterangan: 'TF' },
      { nomor: 9, tanggal: '2026-05-29', namaPasien: 'Sari Indah', penjualan: 'Toner AHA', hargaJual: 160000, pengeluaran: 0, keterangan: 'Cash' },
      { nomor: 10, tanggal: '2026-05-31', namaPasien: 'Bagas Aditya', penjualan: 'Moisturizer', hargaJual: 190000, pengeluaran: 50000, keterangan: 'TF' },
    ]
    let runningSaldo = 0
    for (const c of creamData) {
      runningSaldo += c.hargaJual - c.pengeluaran
      await prisma.cream.create({ data: { ...c, bulan: '2026-05', saldo: runningSaldo } })
    }

    // ---- Faktur Obat ----
    await prisma.fakturObat.createMany({
      data: [
        { nomor: 1, tanggal: '2026-05-03', pbfToko: 'PT Kimia Farma', harga: 450000, keterangan: 'Amoksisilin, Paracetamol', bulan: '2026-05' },
        { nomor: 2, tanggal: '2026-05-10', pbfToko: 'Apotek Sehat', harga: 375000, keterangan: 'Vitamin C, B Complex', bulan: '2026-05' },
        { nomor: 3, tanggal: '2026-05-15', pbfToko: 'PT Kimia Farma', harga: 500000, keterangan: 'Antifungal cream', bulan: '2026-05' },
        { nomor: 4, tanggal: '2026-05-22', pbfToko: 'PT Indo Farma', harga: 450000, keterangan: 'Antibiotik salep', bulan: '2026-05' },
        { nomor: 5, tanggal: '2026-05-28', pbfToko: 'Apotek Sehat', harga: 375000, keterangan: 'Antihistamin, CTM', bulan: '2026-05' },
      ],
    })

    seedingDone = true
  })()

  try {
    await seedingPromise
  } finally {
    seedingPromise = null
  }
}
