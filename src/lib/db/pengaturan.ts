import { getDB } from './index'
import type { Pengaturan, TargetHarian } from '@/types'

const PENGATURAN_KEY = 'app-pengaturan'

export function getDefaultPengaturan(): Pengaturan {
  return {
    namaBisnis: 'Bisnis Saya',
    targetHarian: {
      jumlahPorsi: 10,
      hargaPerPorsi: 10000,
    },
    batasPrive: 1000000,
  }
}

export async function getPengaturan(): Promise<Pengaturan> {
  const db = await getDB()
  const data = await db.get('pengaturan', PENGATURAN_KEY)
  if (!data) return getDefaultPengaturan()
  return data.value as Pengaturan
}

export async function savePengaturan(pengaturan: Pengaturan): Promise<void> {
  const db = await getDB()
  await db.put('pengaturan', { key: PENGATURAN_KEY, value: pengaturan })
}

export async function updateNamaBisnis(nama: string): Promise<void> {
  const pengaturan = await getPengaturan()
  pengaturan.namaBisnis = nama
  await savePengaturan(pengaturan)
}

export async function updateTargetHarian(target: TargetHarian): Promise<void> {
  const pengaturan = await getPengaturan()
  pengaturan.targetHarian = target
  await savePengaturan(pengaturan)
}

export async function updateBatasPrive(batas: number): Promise<void> {
  const pengaturan = await getPengaturan()
  pengaturan.batasPrive = batas
  await savePengaturan(pengaturan)
}

export async function resetPengaturan(): Promise<void> {
  const db = await getDB()
  await db.delete('pengaturan', PENGATURAN_KEY)
}
