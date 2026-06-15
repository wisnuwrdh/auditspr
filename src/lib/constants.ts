import type { JenisKategori } from '@/types'

export interface KategoriDefault {
  nama: string
  jenis: JenisKategori
}

export const KATEGORI_DEFAULT: KategoriDefault[] = [
  { nama: 'Penjualan Produk', jenis: 'pemasukan' },
  { nama: 'Penjualan Minuman', jenis: 'pemasukan' },
  { nama: 'Bahan Baku', jenis: 'hpp' },
  { nama: 'Kemasan', jenis: 'hpp' },
  { nama: 'Gas', jenis: 'stok_pendukung' },
  { nama: 'Perlengkapan Makan', jenis: 'stok_pendukung' },
  { nama: 'Sewa Tempat', jenis: 'ops_tetap' },
  { nama: 'Gaji Karyawan', jenis: 'ops_tetap' },
  { nama: 'Listrik & Air', jenis: 'ops_tetap' },
  { nama: 'Ongkos Kirim', jenis: 'ops_variabel' },
  { nama: 'Transportasi', jenis: 'ops_variabel' },
  { nama: 'Lain-lain', jenis: 'ops_variabel' },
]

export const LABEL_JENIS_KATEGORI: Record<JenisKategori, string> = {
  pemasukan: 'Uang masuk dari jualan',
  hpp: 'Bahan untuk bikin produk',
  stok_pendukung: 'Perlengkapan yang dibeli kalau habis',
  ops_tetap: 'Tagihan rutin tiap bulan',
  ops_variabel: 'Pengeluaran tidak tentu',
}

export const TOOLTIP_ISTILAH: Record<string, string> = {
  labaKotor: 'Sisa uang setelah dikurangi bahan baku. Belum dikurangi sewa, listrik, dll.',
  labaBersih: 'Uang yang beneran kamu kantongi setelah semua pengeluaran dikurangi.',
  margin: 'Persentase keuntungan dari total uang masuk. Makin tinggi makin bagus.',
  bep: 'Balik modal artinya uang yang masuk sudah cukup nutup semua biaya hari ini.',
  prive: 'Uang bisnis yang dipakai untuk kebutuhan pribadi atau keluarga.',
  susut: 'Bahan yang sudah dibeli tapi tidak jadi produk terjual — tetap dihitung sebagai kerugian.',
  sisaKas: 'Uang yang tersisa di kas bisnis dari awal usaha sampai sekarang, setelah semua pengeluaran.',
  modalAwal: 'Uang yang pertama kali kamu pakai untuk mulai bisnis ini. Dicatat sekali saja.',
  hutang: 'Uang atau barang yang kamu ambil dulu dan belum dibayar ke orang lain.',
  sisaHutang: 'Sisa hutang yang belum dibayar. Makin cepat dilunasi makin baik.',
}

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
