import { getDB } from './index'
import type { Transaksi } from '@/types'

export async function getAllTransaksi(): Promise<Transaksi[]> {
  const db = await getDB()
  return db.getAll('transaksi')
}

export async function getTransaksiByTanggal(tanggal: string): Promise<Transaksi[]> {
  const db = await getDB()
  const index = db.transaction('transaksi').store.index('tanggal')
  return index.getAll(tanggal)
}

export async function getTransaksiByBulan(bulan: string): Promise<Transaksi[]> {
  const db = await getDB()
  const all = await db.getAll('transaksi')
  return all.filter(t => t.tanggal.startsWith(bulan))
}

export async function getTransaksiByRange(startDate: string, endDate: string): Promise<Transaksi[]> {
  const db = await getDB()
  const all = await db.getAll('transaksi')
  return all.filter(t => t.tanggal >= startDate && t.tanggal <= endDate)
}

export async function addTransaksi(transaksi: Transaksi): Promise<void> {
  const db = await getDB()
  await db.add('transaksi', transaksi)
}

export async function updateTransaksi(transaksi: Transaksi): Promise<void> {
  const db = await getDB()
  await db.put('transaksi', transaksi)
}

export async function deleteTransaksi(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('transaksi', id)
}

export async function getJumlahTransaksiByJenis(tanggal: string, jenis: string): Promise<number> {
  const db = await getDB()
  const all = await db.getAll('transaksi')
  return all.filter(t => t.tanggal === tanggal && t.jenis === jenis).length
}

export async function getTotalPengeluaranByTanggal(tanggal: string): Promise<number> {
  const db = await getDB()
  const all = await db.getAll('transaksi')
  return all
    .filter(t => t.tanggal === tanggal && t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.nominal, 0)
}

export async function getTotalPemasukanByTanggal(tanggal: string): Promise<number> {
  const db = await getDB()
  const all = await db.getAll('transaksi')
  return all
    .filter(t => t.tanggal === tanggal && t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.nominal, 0)
}
