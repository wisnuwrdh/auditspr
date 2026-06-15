import type { Transaksi, RingkasanHarian, RingkasanBulanan, Kategori, PembayaranHutang, ModalAwal } from '@/types'

type KategoriMap = Map<string, string>

function buildKategoriMap(kategori: Kategori[]): KategoriMap {
  const map = new Map<string, string>()
  for (const k of kategori) {
    map.set(k.id, k.jenis)
  }
  return map
}

function totalByKategoriJenis(transaksi: Transaksi[], jenis: string, katMap: KategoriMap): number {
  return transaksi
    .filter(t => {
      if (t.jenis !== 'pengeluaran') return false
      const j = katMap.get(t.kategoriId)
      return j === jenis
    })
    .reduce((sum, t) => sum + t.nominal, 0)
}

export function hitungRingkasanHarian(transaksi: Transaksi[], kategori: Kategori[] = []): RingkasanHarian {
  const katMap = buildKategoriMap(kategori)

  const totalPemasukan = transaksi
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.nominal, 0)

  const totalHPP = totalByKategoriJenis(transaksi, 'hpp', katMap)
  const totalStokPendukung = totalByKategoriJenis(transaksi, 'stok_pendukung', katMap)
  const totalOpsTetap = totalByKategoriJenis(transaksi, 'ops_tetap', katMap)
  const totalOpsVariabel = totalByKategoriJenis(transaksi, 'ops_variabel', katMap)

  const totalPrive = transaksi
    .filter(t => t.jenis === 'prive')
    .reduce((sum, t) => sum + t.nominal, 0)

  const labaKotor = totalPemasukan - totalHPP
  const totalOps = totalStokPendukung + totalOpsTetap + totalOpsVariabel
  const labaBersih = labaKotor - totalOps
  const sisaKas = labaBersih - totalPrive

  const marginKotor = totalPemasukan > 0 ? (labaKotor / totalPemasukan) * 100 : 0
  const marginBersih = totalPemasukan > 0 ? (labaBersih / totalPemasukan) * 100 : 0

  const bepHarian = totalHPP + totalStokPendukung + totalOpsTetap + totalOpsVariabel
  const sudahBEP = totalPemasukan >= bepHarian

  return {
    tanggal: '',
    totalPemasukan,
    totalHPP,
    totalStokPendukung,
    totalOpsTetap,
    totalOpsVariabel,
    totalPrive,
    labaKotor,
    labaBersih,
    sisaKas,
    marginKotor,
    marginBersih,
    sudahBEP,
  }
}

export function hitungRingkasanBulanan(transaksi: Transaksi[], bulan: string, kategori: Kategori[] = [], pembayaranHutang: PembayaranHutang[] = []): RingkasanBulanan {
  const transBulan = transaksi.filter(t => t.tanggal.startsWith(bulan))
  const ringkasanHarian = hitungRingkasanHarian(transBulan, kategori)

  const totalBayarHutang = pembayaranHutang
    .filter(p => p.tanggal.startsWith(bulan))
    .reduce((sum, p) => sum + p.nominal, 0)

  const harianMap = new Map<string, number>()
  transBulan
    .filter(t => t.jenis === 'pemasukan')
    .forEach(t => {
      harianMap.set(t.tanggal, (harianMap.get(t.tanggal) || 0) + t.nominal)
    })

  let hariTerbaikOmzet = ''
  let hariTersepiOmzet = ''
  let omzetMax = 0
  let omzetMin = Infinity

  harianMap.forEach((total, tgl) => {
    if (total > omzetMax) {
      omzetMax = total
      hariTerbaikOmzet = tgl
    }
    if (total < omzetMin) {
      omzetMin = total
      hariTersepiOmzet = tgl
    }
  })

  const jumlahHari = harianMap.size || 1
  const rataOmzetHarian = ringkasanHarian.totalPemasukan / jumlahHari

  return {
    bulan,
    totalPemasukan: ringkasanHarian.totalPemasukan,
    totalHPP: ringkasanHarian.totalHPP,
    totalOps: ringkasanHarian.totalStokPendukung + ringkasanHarian.totalOpsTetap + ringkasanHarian.totalOpsVariabel,
    totalPrive: ringkasanHarian.totalPrive,
    totalBayarHutang,
    labaKotor: ringkasanHarian.labaKotor,
    labaBersih: ringkasanHarian.labaBersih,
    sisaKas: ringkasanHarian.sisaKas,
    marginKotor: ringkasanHarian.marginKotor,
    marginBersih: ringkasanHarian.marginBersih,
    rataOmzetHarian,
    hariTerbaikOmzet,
    hariTersepiOmzet,
  }
}

export function groupPengeluaranByKategori(transaksi: Transaksi[], kategori: Kategori[]): Map<string, number> {
  const katMap = buildKategoriMap(kategori)
  const result = new Map<string, number>()

  for (const t of transaksi.filter(t => t.jenis === 'pengeluaran')) {
    const jenis = katMap.get(t.kategoriId) || 'unknown'
    result.set(jenis, (result.get(jenis) || 0) + t.nominal)
  }

  return result
}

export function hitungSisaKasTotal(
  modalAwal: ModalAwal,
  transaksi: Transaksi[],
  kategori: Kategori[]
): number {
  const ringkasan = hitungRingkasanHarian(transaksi, kategori)
  const totalBayarHutang = transaksi
    .filter(t => t.jenis === 'bayar_hutang')
    .reduce((sum, t) => sum + t.nominal, 0)
  return modalAwal.dariSendiri + ringkasan.totalPemasukan - ringkasan.totalHPP - ringkasan.totalStokPendukung - ringkasan.totalOpsTetap - ringkasan.totalOpsVariabel - ringkasan.totalPrive - totalBayarHutang
}
