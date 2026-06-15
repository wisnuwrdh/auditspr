import { getDB } from './index'
import type { Transaksi } from '@/types'

export async function getAllTransaksi(): Promise<Transaksi[]> {
  const db = await getDB()
  return db.getAll('transaksi')
}

export async function getTransaksiByTanggal(tanggal: string): Promise<Transaksi[]> {
  const db = await getDB()
  const index = db.transaction('transaksi').store.index('by-tanggal')
  return index.getAll(tanggal)
}

export async function getTransaksiByBulan(bulan: string): Promise<Transaksi[]> {
  const db = await getDB()
  const semua = await db.getAll('transaksi')
  return semua.filter(t => t.tanggal.startsWith(bulan))
}

export async function addTransaksi(transaksi: Transaksi): Promise<void> {
  const db = await getDB()
  await db.add('transaksi', transaksi)
}

export async function updateTransaksi(id: string, data: Partial<Transaksi>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('transaksi', id)
  if (!existing) return
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
  await db.put('transaksi', updated)
}

export async function deleteTransaksi(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('transaksi', id)
}
