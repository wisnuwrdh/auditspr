'use client'

import Card from '@/components/ui/Card'
import { formatNamaHari, formatRupiah } from '@/lib/utils/format'
import type { Transaksi } from '@/types'

interface GrafikTrenProps {
  transaksi: Transaksi[]
}

interface DataPoint {
  label: string
  tanggal: string
  omzet: number
  pengeluaran: number
}

export default function GrafikTren({ transaksi }: GrafikTrenProps) {
  const today = new Date()
  const days: DataPoint[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const tgl = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const label = formatNamaHari(tgl)

    const omzet = transaksi
      .filter(t => t.tanggal === tgl && t.jenis === 'pemasukan')
      .reduce((sum, t) => sum + t.nominal, 0)

    const pengeluaran = transaksi
      .filter(t => t.tanggal === tgl && t.jenis === 'pengeluaran')
      .reduce((sum, t) => sum + t.nominal, 0)

    days.push({ label, tanggal: tgl, omzet, pengeluaran })
  }

  const maxVal = Math.max(...days.map(d => Math.max(d.omzet, d.pengeluaran, 1)))

  return (
    <Card>
      <p className="text-sm font-medium text-[#64748B] mb-4">Grafik 7 hari terakhir</p>
      <div className="flex items-end gap-1.5 h-28">
        {days.map((day) => (
          <div key={day.tanggal} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            <div className="w-full flex flex-col items-center gap-0.5 h-full justify-end">
              <div
                className="w-full bg-[#DC2626] rounded-t-sm transition-all"
                style={{ height: `${(day.pengeluaran / maxVal) * 100}%`, minHeight: day.pengeluaran > 0 ? '4px' : '0' }}
                title={`Pengeluaran: ${formatRupiah(day.pengeluaran)}`}
              />
              <div
                className="w-full bg-[#2563EB] rounded-t-sm transition-all"
                style={{ height: `${(day.omzet / maxVal) * 100}%`, minHeight: day.omzet > 0 ? '4px' : '0' }}
                title={`Omzet: ${formatRupiah(day.omzet)}`}
              />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1">{day.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
          Omzet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
          Pengeluaran
        </div>
      </div>
    </Card>
  )
}
