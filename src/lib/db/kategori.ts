import { getDB, ensureDefaultKategori } from './index'
import type { Kategori } from '@/types'

export async function getAllKategori(): Promise<Kategori[]> {
  await ensureDefaultKategori()
  const db = await getDB()
  return db.getAll('kategori')
}

export async function getKategoriByJenis(jenis: string): Promise<Kategori[]> {
  const db = await getDB()
  const index = db.transaction('kategori').store.index('jenis')
  return index.getAll(jenis)
}

export async function getKategori(id: string): Promise<Kategori | undefined> {
  const db = await getDB()
  return db.get('kategori', id)
}

export async function addKategori(kategori: Kategori): Promise<void> {
  const db = await getDB()

  const all = await db.getAll('kategori')
  const exists = all.some(k => k.nama === kategori.nama && k.jenis === kategori.jenis)
  if (exists) return

  await db.add('kategori', kategori)
}

export async function updateKategori(kategori: Kategori): Promise<void> {
  const db = await getDB()
  await db.put('kategori', kategori)
}

export async function deleteKategori(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('kategori', id)
}

export { ensureDefaultKategori }
