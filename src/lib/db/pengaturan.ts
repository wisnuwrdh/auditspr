import { getDB } from './index'
import type { Pengaturan, ModalAwal } from '@/types'

const KEY = 'pengaturan-utama'

export async function getPengaturan(): Promise<Pengaturan | null> {
  const db = await getDB()
  const data = await db.get('pengaturan', KEY) as Pengaturan | undefined
  return data || null
}

export async function savePengaturan(pengaturan: Pengaturan): Promise<void> {
  const db = await getDB()
  await db.put('pengaturan', pengaturan, KEY)
}

export async function saveModalAwal(modalAwal: ModalAwal): Promise<void> {
  const db = await getDB()
  const pengaturan = await db.get('pengaturan', KEY) as Pengaturan | undefined
  if (pengaturan) {
    pengaturan.modalAwal = modalAwal
    await db.put('pengaturan', pengaturan, KEY)
  } else {
    const defaultPengaturan: Pengaturan = {
      namaBisnis: '',
      targetHarian: { jumlahPorsi: 0, hargaPerPorsi: 0 },
      batasPrive: 0,
      modalAwal,
    }
    await db.put('pengaturan', defaultPengaturan, KEY)
  }
}

export async function getModalAwal(): Promise<ModalAwal> {
  const pengaturan = await getPengaturan()
  return pengaturan?.modalAwal || {
    totalModal: 0,
    dariSendiri: 0,
    dariHutang: 0,
    tanggalMulai: new Date().toISOString().substring(0, 10),
    sudahDiisi: false,
  }
}
