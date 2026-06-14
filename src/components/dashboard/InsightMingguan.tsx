'use client'

import Card from '@/components/ui/Card'
import { formatRupiah, formatNamaHari } from '@/lib/utils/format'
import type { Transaksi } from '@/types'

interface InsightMingguanProps {
  transaksi: Transaksi[]
}

export default function InsightMingguan({ transaksi }: InsightMingguanProps) {
  const today = new Date()
  const days: { tanggal: string; omzet: number; pengeluaran: number; laba: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const tgl = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const harian = transaksi.filter(t => t.tanggal === tgl)
    const omzet = harian.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + t.nominal, 0)
    const pengeluaran = harian.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
    const laba = omzet - pengeluaran

    days.push({ tanggal: tgl, omzet, pengeluaran, laba })
  }

  const hariTerbaik = days.reduce((best, d) => d.laba > best.laba ? d : best, days[0])
  const totalOmzetMinggu = days.reduce((s, d) => s + d.omzet, 0)
  const totalLabaMinggu = days.reduce((s, d) => s + d.laba, 0)
  const rataLabaHarian = totalLabaMinggu / 7

  const hariBerpenghasilan = days.filter(d => d.omzet > 0)

  if (hariBerpenghasilan.length === 0) return null

  return (
    <Card>
      <p className="text-sm font-medium text-[#64748B] mb-3">Insight Minggu Ini</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#64748B]">Hari terbaik</span>
          <span className="font-semibold text-[#16A34A]">
            {formatNamaHari(hariTerbaik.tanggal)} ({formatRupiah(hariTerbaik.laba)})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Total omzet 7 hari</span>
          <span className="font-semibold text-[#0F172A]">{formatRupiah(totalOmzetMinggu)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B]">Rata-rata laba harian</span>
          <span className={`font-semibold ${rataLabaHarian >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {formatRupiah(Math.round(rataLabaHarian))}
          </span>
        </div>
      </div>
    </Card>
  )
}
