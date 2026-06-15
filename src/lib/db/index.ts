import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'cashflow-umkm'
const DB_VERSION = 2

export interface CashflowDB {
  transaksi: {
    key: string
    value: import('@/types').Transaksi
    indexes: {
      'by-tanggal': string
      'by-jenis': string
    }
  }
  kategori: {
    key: string
    value: import('@/types').Kategori
    indexes: {
      'by-jenis': string
    }
  }
  pengaturan: {
    key: string
    value: import('@/types').Pengaturan
  }
  hutang: {
    key: string
    value: import('@/types').Hutang
    indexes: {
      'by-status': string
    }
  }
  pembayaran_hutang: {
    key: string
    value: import('@/types').PembayaranHutang
    indexes: {
      'by-hutang': string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<CashflowDB>> | null = null

function getDB(): Promise<IDBPDatabase<CashflowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CashflowDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const transaksiStore = db.createObjectStore('transaksi', { keyPath: 'id' })
          transaksiStore.createIndex('by-tanggal', 'tanggal')
          transaksiStore.createIndex('by-jenis', 'jenis')

          const kategoriStore = db.createObjectStore('kategori', { keyPath: 'id' })
          kategoriStore.createIndex('by-jenis', 'jenis')

          db.createObjectStore('pengaturan', { keyPath: 'id' })
        }

        if (oldVersion < 2) {
          const hutangStore = db.createObjectStore('hutang', { keyPath: 'id' })
          hutangStore.createIndex('by-status', 'status')

          const pembayaranStore = db.createObjectStore('pembayaran_hutang', { keyPath: 'id' })
          pembayaranStore.createIndex('by-hutang', 'hutangId')

          if (!db.objectStoreNames.contains('transaksi')) {
            const transaksiStore = db.createObjectStore('transaksi', { keyPath: 'id' })
            transaksiStore.createIndex('by-tanggal', 'tanggal')
            transaksiStore.createIndex('by-jenis', 'jenis')
          }
        }
      },
    })
  }
  return dbPromise
}

export { getDB }

import type { Kategori } from '@/types'
import { KATEGORI_DEFAULT } from '@/lib/constants'
import { v4 as uuid } from 'uuid'

export async function ensureDefaultKategori(): Promise<Kategori[]> {
  const db = await getDB()
  const existing = await db.getAll('kategori') as Kategori[]

  if (existing.length === 0) {
    const defaults: Kategori[] = KATEGORI_DEFAULT.map(k => ({
      id: uuid(),
      nama: k.nama,
      jenis: k.jenis,
      isDefault: true,
      createdAt: new Date().toISOString(),
    }))
    for (const k of defaults) {
      await db.add('kategori', k)
    }
    return defaults
  }

  for (const def of KATEGORI_DEFAULT) {
    const exists = existing.some(e => e.nama === def.nama && e.jenis === def.jenis)
    if (!exists) {
      const baru: Kategori = {
        id: uuid(),
        nama: def.nama,
        jenis: def.jenis,
        isDefault: true,
        createdAt: new Date().toISOString(),
      }
      await db.add('kategori', baru)
      existing.push(baru)
    }
  }

  return existing
}
