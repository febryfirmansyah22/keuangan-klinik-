-- CreateTable
CREATE TABLE "ObservasiUmum" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomor" INTEGER NOT NULL,
    "tanggal" TEXT NOT NULL,
    "namaPasien" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "pembayaran" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "setor" INTEGER NOT NULL DEFAULT 0,
    "bulan" TEXT NOT NULL,
    "minggu" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Cream" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomor" INTEGER NOT NULL,
    "tanggal" TEXT NOT NULL,
    "namaPasien" TEXT NOT NULL,
    "penjualan" TEXT NOT NULL,
    "hargaJual" INTEGER NOT NULL,
    "pengeluaran" INTEGER NOT NULL DEFAULT 0,
    "keterangan" TEXT NOT NULL,
    "saldo" INTEGER NOT NULL,
    "bulan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FakturObat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomor" INTEGER NOT NULL,
    "tanggal" TEXT NOT NULL,
    "pbfToko" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "bulan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
