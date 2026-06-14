export type JenisTransaksi = 'pemasukan' | 'pengeluaran' | 'prive'

export type JenisKategori =
  | 'pemasukan'
  | 'hpp'
  | 'stok_pendukung'
  | 'ops_tetap'
  | 'ops_variabel'

export interface Kategori {
  id: string
  nama: string
  jenis: JenisKategori
  isDefault: boolean
  createdAt: string
}

export interface Transaksi {
  id: string
  tanggal: string
  jenis: JenisTransaksi
  kategoriId: string
  nominal: number
  catatan?: string
  isSusut?: boolean
  createdAt: string
  updatedAt: string
}

export interface TargetHarian {
  jumlahPorsi: number
  hargaPerPorsi: number
}

export interface Pengaturan {
  namaBisnis: string
  targetHarian: TargetHarian
  batasPrive: number
}

export interface RingkasanHarian {
  tanggal: string
  totalPemasukan: number
  totalHPP: number
  totalStokPendukung: number
  totalOpsTetap: number
  totalOpsVariabel: number
  totalPrive: number
  labaKotor: number
  labaBersih: number
  sisaKas: number
  marginKotor: number
  marginBersih: number
  sudahBEP: boolean
}

export interface RingkasanBulanan {
  bulan: string
  totalPemasukan: number
  totalHPP: number
  totalOps: number
  totalPrive: number
  labaKotor: number
  labaBersih: number
  sisaKas: number
  marginKotor: number
  marginBersih: number
  rataOmzetHarian: number
  hariTerbaikOmzet: string
  hariTersepiOmzet: string
}
