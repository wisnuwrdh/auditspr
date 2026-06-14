import * as XLSX from 'xlsx'
import type { Transaksi, Kategori } from '@/types'

const BACKUP_MARKER = 'CASHFLOW-UMKM-BACKUP'

export interface BackupData {
  marker: string
  version: string
  exportedAt: string
}

export async function exportToExcel(
  transaksi: Transaksi[],
  kategori: Kategori[],
  ringkasanBulanan: { bulan: string; totalPemasukan: number; totalHPP: number; totalOps: number; labaKotor: number; labaBersih: number; totalPrive: number; sisaKas: number; marginKotor: number; marginBersih: number }[]
): Promise<number[]> {
  const wb = XLSX.utils.book_new()

  const dataTransaksi = transaksi.map(t => ({
    Tanggal: t.tanggal,
    Jenis: t.jenis,
    Kategori: t.kategoriId,
    Nominal: t.nominal,
    Catatan: t.catatan || '',
    Susut: t.isSusut ? 'Ya' : 'Tidak',
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

  const ws4 = XLSX.utils.json_to_sheet([{
    marker: BACKUP_MARKER,
    version: '1.0',
    exportedAt: new Date().toISOString(),
  }])
  XLSX.utils.book_append_sheet(wb, ws4, 'Info Backup')

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
}

export function parseBackupFile(data: ArrayBuffer): RestoredData {
  const wb = XLSX.read(data, { type: 'array' })

  const transSheet = wb.Sheets['Data Transaksi']
  const transRaw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(transSheet)

  const katSheet = wb.Sheets['Kategori']
  const katRaw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(katSheet)

  const transaksi: Transaksi[] = transRaw.map((r, i: number) => ({
    id: `restored-${Date.now()}-${i}`,
    tanggal: String(r.Tanggal || ''),
    jenis: String(r.Jenis || 'pemasukan') as 'pemasukan' | 'pengeluaran' | 'prive',
    kategoriId: String(r.Kategori || ''),
    nominal: Number(r.Nominal || 0),
    catatan: r.Catatan ? String(r.Catatan) : undefined,
    isSusut: r.Susut === 'Ya',
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

  return { transaksi, kategori }
}
