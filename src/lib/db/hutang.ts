import { getDB } from './index'
import { v4 as uuid } from 'uuid'
import type { Hutang, PembayaranHutang } from '@/types'

export async function getAllHutang(): Promise<Hutang[]> {
  const db = await getDB()
  return db.getAll('hutang')
}

export async function getHutangById(id: string): Promise<Hutang | undefined> {
  const db = await getDB()
  return db.get('hutang', id)
}

export async function addHutang(data: Omit<Hutang, 'id' | 'totalDibayar' | 'sisaHutang' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = uuid()
  const now = new Date().toISOString()
  const hutang: Hutang = {
    ...data,
    id,
    totalDibayar: 0,
    sisaHutang: data.totalHutang,
    status: 'aktif',
    createdAt: now,
    updatedAt: now,
  }
  const db = await getDB()
  await db.add('hutang', hutang)
  return id
}

export async function updateHutang(id: string, data: Partial<Hutang>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('hutang', id)
  if (!existing) return
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
  await db.put('hutang', updated)
}

export async function deleteHutang(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('hutang', id)
  const tx = db.transaction('pembayaran_hutang', 'readwrite')
  let cursor = await tx.store.index('by-hutang').openCursor(id)
  while (cursor) {
    cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

export async function getPembayaranByHutang(hutangId: string): Promise<PembayaranHutang[]> {
  const db = await getDB()
  const index = db.transaction('pembayaran_hutang').store.index('by-hutang')
  return index.getAll(hutangId)
}

export async function addPembayaranHutang(hutangId: string, nominal: number, tanggal: string, catatan?: string): Promise<void> {
  const db = await getDB()
  const hutang = await db.get('hutang', hutangId)
  if (!hutang) return

  const pembayaran: PembayaranHutang = {
    id: uuid(),
    hutangId,
    nominal,
    tanggal,
    catatan,
    createdAt: new Date().toISOString(),
  }

  const totalDibayarBaru = hutang.totalDibayar + nominal
  const sisaHutangBaru = hutang.totalHutang - totalDibayarBaru

  const tx = db.transaction(['hutang', 'pembayaran_hutang'], 'readwrite')
  await tx.objectStore('pembayaran_hutang').add(pembayaran)
  await tx.objectStore('hutang').put({
    ...hutang,
    totalDibayar: totalDibayarBaru,
    sisaHutang: sisaHutangBaru,
    status: sisaHutangBaru <= 0 ? 'lunas' : 'aktif',
    updatedAt: new Date().toISOString(),
  })
  await tx.done
}

export async function deletePembayaranHutang(id: string, hutangId: string): Promise<void> {
  const db = await getDB()
  const pembayaran = await db.get('pembayaran_hutang', id)
  if (!pembayaran) return

  const hutang = await db.get('hutang', hutangId)
  if (!hutang) return

  const totalDibayarBaru = Math.max(0, hutang.totalDibayar - pembayaran.nominal)
  const sisaHutangBaru = hutang.totalHutang - totalDibayarBaru

  const tx = db.transaction(['hutang', 'pembayaran_hutang'], 'readwrite')
  await tx.objectStore('pembayaran_hutang').delete(id)
  await tx.objectStore('hutang').put({
    ...hutang,
    totalDibayar: totalDibayarBaru,
    sisaHutang: sisaHutangBaru,
    status: sisaHutangBaru <= 0 ? 'lunas' : 'aktif',
    updatedAt: new Date().toISOString(),
  })
  await tx.done
}

export async function getRingkasanHutang(): Promise<{
  totalHutangAktif: number
  totalSudahDibayar: number
  totalSisaHutang: number
  jumlahKreditur: number
}> {
  const db = await getDB()
  const semua = await db.getAll('hutang')
  const aktif = semua.filter(h => h.status === 'aktif')
  return {
    totalHutangAktif: aktif.reduce((sum, h) => sum + h.sisaHutang, 0),
    totalSudahDibayar: aktif.reduce((sum, h) => sum + h.totalDibayar, 0),
    totalSisaHutang: aktif.reduce((sum, h) => sum + h.sisaHutang, 0),
    jumlahKreditur: aktif.length,
  }
}
