import * as XLSX from 'xlsx'
import type { Transaksi, Kategori, Hutang, PembayaranHutang } from '@/types'

const BACKUP_MARKER = 'CASHFLOW_UMKM_BACKUP_V2'

export interface BackupData {
  marker: string
  version: string
  exportedAt: string
}

export async function exportToExcel(
  transaksi: Transaksi[],
  kategori: Kategori[],
  hutang: Hutang[],
  pembayaranHutang: PembayaranHutang[],
  ringkasanBulanan: {
    bulan: string
    totalPemasukan: number
    totalHPP: number
    totalOps: number
    labaKotor: number
    labaBersih: number
    totalPrive: number
    totalBayarHutang: number
    sisaKas: number
    marginKotor: number
    marginBersih: number
  }[]
): Promise<number[]> {
  const wb = XLSX.utils.book_new()

  const dataTransaksi = transaksi.map(t => ({
    Tanggal: t.tanggal,
    Jenis: t.jenis,
    Kategori: t.kategoriId,
    Nominal: t.nominal,
    Catatan: t.catatan || '',
    Susut: t.isSusut ? 'Ya' : 'Tidak',
    Hutang: t.isHutang ? 'Ya' : 'Tidak',
    ID_Hutang: t.hutangId || '',
  }))
  const ws1 = XLSX.utils.json_to_sheet(dataTransaksi)
  XLSX.utils.book_append_sheet(wb, ws1, 'Data Transaksi')

  const dataRingkasan = ringkasanBulanan.map(r => ({
    Bulan: r.bulan,
    'Total Masuk': r.totalPemasukan,
    HPP: r.totalHPP,
    'Ops Total': r.totalOps,
    'Laba Kotor': r.labaKotor,
    'Laba Bersih': r.labaBersih,
    Prive: r.totalPrive,
    'Bayar Hutang': r.totalBayarHutang,
    'Sisa Kas': r.sisaKas,
    'Margin Kotor %': r.marginKotor,
    'Margin Bersih %': r.marginBersih,
  }))
  const ws2 = XLSX.utils.json_to_sheet(dataRingkasan)
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan Bulanan')

  const dataKategori = kategori.map(k => ({
    Nama: k.nama,
    Jenis: k.jenis,
    Default: k.isDefault ? 'Ya' : 'Tidak',
  }))
  const ws3 = XLSX.utils.json_to_sheet(dataKategori)
  XLSX.utils.book_append_sheet(wb, ws3, 'Kategori')

  const dataHutang = hutang.map(h => ({
    ID: h.id,
    Kreditur: h.namaKreditur,
    Jenis: h.jenisHutang,
    Total: h.totalHutang,
    Dibayar: h.totalDibayar,
    Sisa: h.sisaHutang,
    Status: h.status,
    Tanggal: h.tanggalHutang,
    Catatan: h.catatan || '',
  }))
  const ws4 = XLSX.utils.json_to_sheet(dataHutang)
  XLSX.utils.book_append_sheet(wb, ws4, 'Hutang')

  const dataPembayaran = pembayaranHutang.map(p => ({
    ID_Hutang: p.hutangId,
    Nominal: p.nominal,
    Tanggal: p.tanggal,
    Catatan: p.catatan || '',
  }))
  const ws5 = XLSX.utils.json_to_sheet(dataPembayaran)
  XLSX.utils.book_append_sheet(wb, ws5, 'Pembayaran Hutang')

  const wsInfo = XLSX.utils.json_to_sheet([{
    marker: BACKUP_MARKER,
    version: '2.0',
    exportedAt: new Date().toISOString(),
  }])
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Backup')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return Array.from(wbout)
}

export function validateBackupFile(data: ArrayBuffer): boolean {
  try {
    const wb = XLSX.read(data, { type: 'array' })
    const sheetNames = wb.SheetNames
    if (!sheetNames.includes('Info Backup')) return false
    const infoSheet = wb.Sheets['Info Backup']
    const infoJson = XLSX.utils.sheet_to_json(infoSheet) as BackupData[]
    if (!infoJson || infoJson.length === 0) return false
    return infoJson[0].marker === BACKUP_MARKER
  } catch {
    return false
  }
}

export interface RestoredData {
  transaksi: Transaksi[]
  kategori: Kategori[]
  hutang: Hutang[]
  pembayaranHutang: PembayaranHutang[]
}

export function parseBackupFile(data: ArrayBuffer): RestoredData {
  const wb = XLSX.read(data, { type: 'array' })

  const transSheet = wb.Sheets['Data Transaksi']
  const transRaw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(transSheet)

  const katSheet = wb.Sheets['Kategori']
  const katRaw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(katSheet)

  const hutangSheet = wb.Sheets['Hutang']
  const hutangRaw: Record<string, unknown>[] = hutangSheet ? XLSX.utils.sheet_to_json(hutangSheet) : []

  const pembayaranSheet = wb.Sheets['Pembayaran Hutang']
  const pembayaranRaw: Record<string, unknown>[] = pembayaranSheet ? XLSX.utils.sheet_to_json(pembayaranSheet) : []

  const transaksi: Transaksi[] = transRaw.map((r, i: number) => ({
    id: `restored-${Date.now()}-${i}`,
    tanggal: String(r.Tanggal || ''),
    jenis: String(r.Jenis || 'pemasukan') as 'pemasukan' | 'pengeluaran' | 'prive' | 'bayar_hutang',
    kategoriId: String(r.Kategori || ''),
    nominal: Number(r.Nominal || 0),
    catatan: r.Catatan ? String(r.Catatan) : undefined,
    isSusut: r.Susut === 'Ya',
    isHutang: r.Hutang === 'Ya',
    hutangId: r.ID_Hutang ? String(r.ID_Hutang) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const kategori: Kategori[] = katRaw.map((r, i: number) => ({
    id: `restored-kat-${Date.now()}-${i}`,
    nama: String(r.Nama || ''),
    jenis: String(r.Jenis || 'pemasukan') as 'pemasukan' | 'hpp' | 'stok_pendukung' | 'ops_tetap' | 'ops_variabel',
    isDefault: r.Default === 'Ya',
    createdAt: new Date().toISOString(),
  }))

  const hutang: Hutang[] = hutangRaw.map((r, i: number) => ({
    id: String(r.ID || `restored-hutang-${Date.now()}-${i}`),
    namaKreditur: String(r.Kreditur || ''),
    jenisHutang: String(r.Jenis || 'operasional') as 'modal' | 'operasional',
    totalHutang: Number(r.Total || 0),
    totalDibayar: Number(r.Dibayar || 0),
    sisaHutang: Number(r.Sisa || 0),
    status: String(r.Status || 'aktif') as 'aktif' | 'lunas' | 'dihapuskan',
    tanggalHutang: String(r.Tanggal || ''),
    catatan: r.Catatan ? String(r.Catatan) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const pembayaranHutang: PembayaranHutang[] = pembayaranRaw.map((r, i: number) => ({
    id: `restored-pay-${Date.now()}-${i}`,
    hutangId: String(r.ID_Hutang || ''),
    nominal: Number(r.Nominal || 0),
    tanggal: String(r.Tanggal || ''),
    catatan: r.Catatan ? String(r.Catatan) : undefined,
    createdAt: new Date().toISOString(),
  }))

  return { transaksi, kategori, hutang, pembayaranHutang }
}
