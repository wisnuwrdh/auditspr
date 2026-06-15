export type JenisTransaksi = 'pemasukan' | 'pengeluaran' | 'prive' | 'bayar_hutang'

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
  isHutang?: boolean
  hutangId?: string
  createdAt: string
  updatedAt: string
}

export interface ModalAwal {
  totalModal: number
  dariSendiri: number
  dariHutang: number
  tanggalMulai: string
  sudahDiisi: boolean
}

export type JenisHutang = 'modal' | 'operasional'
export type StatusHutang = 'aktif' | 'lunas' | 'dihapuskan'

export interface Hutang {
  id: string
  namaKreditur: string
  jenisHutang: JenisHutang
  totalHutang: number
  totalDibayar: number
  sisaHutang: number
  catatan?: string
  status: StatusHutang
  tanggalHutang: string
  createdAt: string
  updatedAt: string
}

export interface PembayaranHutang {
  id: string
  hutangId: string
  nominal: number
  tanggal: string
  catatan?: string
  createdAt: string
}

export interface TargetHarian {
  jumlahPorsi: number
  hargaPerPorsi: number
}

export interface Pengaturan {
  namaBisnis: string
  targetHarian: TargetHarian
  batasPrive: number
  modalAwal: ModalAwal
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
  totalBayarHutang: number
  labaKotor: number
  labaBersih: number
  sisaKas: number
  marginKotor: number
  marginBersih: number
  rataOmzetHarian: number
  hariTerbaikOmzet: string
  hariTersepiOmzet: string
}

export interface RingkasanHutang {
  totalHutangAktif: number
  totalSudahDibayar: number
  totalSisaHutang: number
  jumlahKreditur: number
}
