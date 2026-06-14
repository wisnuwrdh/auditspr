'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import RingkasanBulananCards from '@/components/laporan/RingkasanBulanan'
import LabaRugi from '@/components/laporan/LabaRugi'
import GrafikBulanan from '@/components/laporan/GrafikBulanan'
import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { getAllTransaksi } from '@/lib/db/transaksi'
import { getAllKategori } from '@/lib/db/kategori'
import { hitungRingkasanHarian } from '@/lib/utils/hitung'
import { formatBulan, formatRupiah, formatTanggal } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'
import type { Transaksi, Kategori } from '@/types'

export default function LaporanPage() {
  const now = new Date()
  const [bulan, setBulan] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [allTrans, kats] = await Promise.all([
        getAllTransaksi(),
        getAllKategori(),
      ])
      setTransaksi(allTrans)
      setKategori(kats)
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const transBulan = transaksi.filter(t => t.tanggal.startsWith(bulan))
  const ringkasan = transBulan.length > 0 ? hitungRingkasanHarian(transBulan, kategori) : null

  const katMap = new Map<string, { nama: string; jenis: string }>()
  for (const k of kategori) {
    katMap.set(k.id, { nama: k.nama, jenis: k.jenis })
  }

  const pengeluaranEntries = new Map<string, number>()
  const pemasukanEntries = new Map<string, number>()

  transBulan.forEach(t => {
    const info = katMap.get(t.kategoriId)
    const nama = info?.nama || 'Kategori telah dihapus'

    if (t.jenis === 'pengeluaran') {
      pengeluaranEntries.set(nama, (pengeluaranEntries.get(nama) || 0) + t.nominal)
    } else if (t.jenis === 'pemasukan') {
      pemasukanEntries.set(nama, (pemasukanEntries.get(nama) || 0) + t.nominal)
    }
  })

  const pengeluaranPerKategori = Array.from(pengeluaranEntries.entries())
    .map(([nama, total]) => ({ nama, total }))
    .sort((a, b) => b.total - a.total)

  const pemasukanPerKategori = Array.from(pemasukanEntries.entries())
    .map(([nama, total]) => ({ nama, total }))
    .sort((a, b) => b.total - a.total)

  const totalSusut = transBulan
    .filter(t => t.isSusut)
    .reduce((s, t) => s + t.nominal, 0)

  const harianMap = new Map<string, { omzet: number; pengeluaran: number; laba: number }>()
  transBulan.forEach(t => {
    if (!harianMap.has(t.tanggal)) {
      harianMap.set(t.tanggal, { omzet: 0, pengeluaran: 0, laba: 0 })
    }
    const data = harianMap.get(t.tanggal)!
    if (t.jenis === 'pemasukan') data.omzet += t.nominal
    if (t.jenis === 'pengeluaran') data.pengeluaran += t.nominal
    data.laba = data.omzet - data.pengeluaran
  })

  const hariBerpenghasilan = Array.from(harianMap.entries()).filter(([, d]) => d.omzet > 0)
  const totalLaba = Array.from(harianMap.values()).reduce((s, d) => s + d.laba, 0)
  const jumlahHari = hariBerpenghasilan.length || 1
  const rataLabaHarian = totalLaba / jumlahHari

  let hariTerbaikOmzet = ''
  let hariTersepiOmzet = ''
  let hariTerbaikLaba = ''
  let omzetMax = 0
  let labaMax = -Infinity
  const hariAktif = Array.from(harianMap.entries()).filter(([, d]) => d.omzet > 0)
  const omzetMin = hariAktif.length > 0 ? Math.min(...hariAktif.map(([, d]) => d.omzet)) : Infinity

  harianMap.forEach((data, tgl) => {
    if (data.omzet > omzetMax) {
      omzetMax = data.omzet
      hariTerbaikOmzet = tgl
    }
    if (data.omzet > 0 && data.omzet <= omzetMin && tgl !== hariTerbaikOmzet) {
      hariTersepiOmzet = tgl
    }
    if (data.laba > labaMax) {
      labaMax = data.laba
      hariTerbaikLaba = tgl
    }
  })

  const prevMonth = () => {
    const [y, m] = bulan.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setBulan(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const nextMonth = () => {
    const [y, m] = bulan.split('-').map(Number)
    const d = new Date(y, m, 1)
    setBulan(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[#64748B] font-medium">Memuat data...</p>
          <p className="text-xs text-[#94A3B8] mt-1">Menyiapkan laporan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <PageHeader title="Laporan" />

      <div className="flex items-center justify-between bg-white rounded-xl border border-[#E2E8F0] px-4 py-3">
        <button onClick={prevMonth} className="p-1 text-[#64748B] hover:text-[#0F172A]">
          <ChevronLeft size={20} />
        </button>
        <p className="text-base font-semibold text-[#0F172A]">{formatBulan(bulan)}</p>
        <button onClick={nextMonth} className="p-1 text-[#64748B] hover:text-[#0F172A]">
          <ChevronRight size={20} />
        </button>
      </div>

      {transBulan.length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-sm font-medium text-[#64748B]">Belum ada data di bulan ini</p>
            <p className="text-xs text-[#94A3B8] mt-1">Catat transaksi dulu ya</p>
          </div>
        </Card>
      )}

      {ringkasan && (
        <>
          <RingkasanBulananCards
            totalPemasukan={ringkasan.totalPemasukan}
            labaKotor={ringkasan.labaKotor}
            labaBersih={ringkasan.labaBersih}
            sisaKas={ringkasan.sisaKas}
            marginKotor={ringkasan.marginKotor}
            marginBersih={ringkasan.marginBersih}
          />

          <Card>
            <p className="text-sm font-medium text-[#64748B] mb-3">Insight Bulan Ini</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#F0FDF4] rounded-lg p-3">
                <p className="text-xs text-[#64748B]">Rata-rata laba harian</p>
                <p className={`text-base font-bold mt-0.5 ${rataLabaHarian >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {formatRupiah(Math.round(rataLabaHarian))}
                </p>
              </div>
              <div className="bg-[#EFF6FF] rounded-lg p-3">
                <p className="text-xs text-[#64748B]">Hari paling rame</p>
                <p className="text-base font-bold mt-0.5 text-[#2563EB]">
                  {hariTerbaikOmzet ? formatTanggal(hariTerbaikOmzet).split(',')[0] : '-'}
                </p>
              </div>
              {hariTerbaikLaba && (
                <div className="bg-[#FFFBEB] rounded-lg p-3">
                  <p className="text-xs text-[#64748B]">Laba terbesar</p>
                  <p className="text-base font-bold mt-0.5 text-[#D97706]">
                    {formatRupiah(labaMax)}
                  </p>
                </div>
              )}
              {hariTersepiOmzet && hariBerpenghasilan.length > 1 && (
                <div className="bg-[#FEF2F2] rounded-lg p-3">
                  <p className="text-xs text-[#64748B]">Hari paling sepi</p>
                  <p className="text-base font-bold mt-0.5 text-[#DC2626]">
                    {formatTanggal(hariTersepiOmzet).split(',')[0]}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <LabaRugi
            totalPemasukan={ringkasan.totalPemasukan}
            totalHPP={ringkasan.totalHPP}
            totalStokPendukung={ringkasan.totalStokPendukung}
            totalOpsTetap={ringkasan.totalOpsTetap}
            totalOpsVariabel={ringkasan.totalOpsVariabel}
            totalPrive={ringkasan.totalPrive}
            labaKotor={ringkasan.labaKotor}
            labaBersih={ringkasan.labaBersih}
            sisaKas={ringkasan.sisaKas}
            marginKotor={ringkasan.marginKotor}
            marginBersih={ringkasan.marginBersih}
          />

          <GrafikBulanan transaksi={transaksi} bulan={bulan} />

          <Card>
            <p className="text-sm font-medium text-[#64748B] mb-3">Pengeluaran per Kategori</p>
            {pengeluaranPerKategori.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-3">Belum ada pengeluaran bulan ini</p>
            ) : (
              <div className="space-y-2">
                {pengeluaranPerKategori.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-[#0F172A]">{item.nama}</span>
                    <span className="text-sm font-semibold tabular-nums text-[#DC2626]">
                      {formatRupiah(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <p className="text-sm font-medium text-[#64748B] mb-3">Pemasukan per Kategori</p>
            {pemasukanPerKategori.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-3">Belum ada pemasukan bulan ini</p>
            ) : (
              <div className="space-y-2">
                {pemasukanPerKategori.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-[#0F172A]">{item.nama}</span>
                    <span className="text-sm font-semibold tabular-nums text-[#16A34A]">
                      {formatRupiah(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-sm font-medium text-[#64748B]">Catatan Susut</p>
              <Tooltip text={TOOLTIP_ISTILAH.susut} />
            </div>
            <p className={`text-lg font-bold tabular-nums ${totalSusut > 0 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
              {formatRupiah(totalSusut)}
            </p>
            {totalSusut === 0 && (
              <p className="text-xs text-[#94A3B8] mt-1">Tidak ada bahan terbuang bulan ini</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
