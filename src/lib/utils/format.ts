import { NAMA_HARI, NAMA_BULAN } from '@/lib/constants'

export function formatRupiah(angka: number): string {
  if (isNaN(angka) || angka === null || angka === undefined) return 'Rp 0'
  const prefix = angka < 0 ? '-Rp ' : 'Rp '
  const abs = Math.abs(angka)
  const formatted = abs.toLocaleString('id-ID')
  return prefix + formatted
}

export function formatRupiahFull(angka: number): string {
  return formatRupiah(angka)
}

export function formatTanggal(tanggalStr: string): string {
  const date = new Date(tanggalStr + 'T00:00:00')
  const hari = NAMA_HARI[date.getDay()]
  const tgl = date.getDate()
  const bulan = NAMA_BULAN[date.getMonth()]
  const tahun = date.getFullYear()
  return `${hari}, ${tgl} ${bulan} ${tahun}`
}

export function formatTanggalSingkat(tanggalStr: string): string {
  const date = new Date(tanggalStr + 'T00:00:00')
  const tgl = date.getDate()
  const bulan = NAMA_BULAN[date.getMonth()]
  return `${tgl} ${bulan}`
}

export function formatNamaHari(tanggalStr: string): string {
  const date = new Date(tanggalStr + 'T00:00:00')
  return NAMA_HARI[date.getDay()].substring(0, 3)
}

export function formatBulan(bulanStr: string): string {
  const [tahun, bulan] = bulanStr.split('-')
  return `${NAMA_BULAN[parseInt(bulan) - 1]} ${tahun}`
}

export function getTodayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function getCurrentMonthISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
