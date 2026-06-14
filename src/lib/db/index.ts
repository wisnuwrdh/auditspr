import { openDB, type IDBPDatabase } from 'idb'
import { KATEGORI_DEFAULT } from '@/lib/constants'
import { v4 as uuid } from 'uuid'
import type { Kategori } from '@/types'

const DB_NAME = 'cashflow-umkm-db'
const DB_VERSION = 2

let dbInstance: IDBPDatabase | null = null
let seedPromise: Promise<void> | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transaksi')) {
        const store = db.createObjectStore('transaksi', { keyPath: 'id' })
        store.createIndex('tanggal', 'tanggal', { unique: false })
        store.createIndex('jenis', 'jenis', { unique: false })
        store.createIndex('kategoriId', 'kategoriId', { unique: false })
      }
      if (!db.objectStoreNames.contains('kategori')) {
        const store = db.createObjectStore('kategori', { keyPath: 'id' })
        store.createIndex('jenis', 'jenis', { unique: false })
      }
      if (!db.objectStoreNames.contains('pengaturan')) {
        db.createObjectStore('pengaturan', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

let seeded = false
export async function ensureDefaultKategori(): Promise<void> {
  if (seeded) return
  if (seedPromise) return seedPromise

  seedPromise = (async () => {
    const db = await getDB()
    const existing = await db.getAll('kategori')

    if (existing.length > 0) {
      const dups = findDuplicateByNameJenis(existing)
      if (dups.length > 0) {
        const tx = db.transaction('kategori', 'readwrite')
        for (const d of dups) {
          await tx.store.delete(d.id)
        }
        await tx.done
      }
      seeded = true
      return
    }

    const kategories: Kategori[] = KATEGORI_DEFAULT.map(k => ({
      id: uuid(),
      nama: k.nama,
      jenis: k.jenis,
      isDefault: true,
      createdAt: new Date().toISOString(),
    }))

    const tx = db.transaction('kategori', 'readwrite')
    for (const k of kategories) {
      await tx.store.add(k)
    }
    await tx.done
    seeded = true
  })()

  return seedPromise
}

function findDuplicateByNameJenis(kategori: Kategori[]): Kategori[] {
  const seen = new Map<string, number>()
  const duplicates: Kategori[] = []

  for (const k of kategori) {
    const key = `${k.nama}|${k.jenis}`
    const count = seen.get(key) || 0
    if (count > 0) {
      duplicates.push(k)
    }
    seen.set(key, count + 1)
  }

  return duplicates
}
