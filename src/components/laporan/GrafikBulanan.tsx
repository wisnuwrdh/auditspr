'use client'

import Card from '@/components/ui/Card'
import { formatRupiah } from '@/lib/utils/format'
import type { Transaksi } from '@/types'

interface GrafikBulananProps {
  transaksi: Transaksi[]
  bulan: string
}

interface DayData {
  tanggal: string
  omzet: number
}

export default function GrafikBulanan({ transaksi, bulan }: GrafikBulananProps) {
  const daysInMonth = getDaysInMonth(bulan)
  const days: DayData[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const tgl = `${bulan}-${String(d).padStart(2, '0')}`
    const omzet = transaksi
      .filter(t => t.tanggal === tgl && t.jenis === 'pemasukan')
      .reduce((sum, t) => sum + t.nominal, 0)
    days.push({ tanggal: tgl, omzet })
  }

  const maxOmzet = Math.max(...days.map(d => d.omzet), 1)
  const rataRata = days.reduce((sum, d) => sum + d.omzet, 0) / daysInMonth

  const totalBiaya = transaksi
    .filter(t => t.tanggal.startsWith(bulan) && t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.nominal, 0)

  return (
    <Card>
      <p className="text-sm font-medium text-[#64748B] mb-1">Grafik Omzet Harian</p>
      <p className="text-xs text-[#64748B] mb-4">
        Total omzet bulan ini: {formatRupiah(days.reduce((s, d) => s + d.omzet, 0))}
        {' | '}Total biaya: {formatRupiah(totalBiaya)}
      </p>

      <div className="relative h-32">
        <div className="flex items-end gap-px h-full">
          {days.map((day) => (
            <div
              key={day.tanggal}
              className="flex-1 flex flex-col justify-end"
              title={`${day.tanggal}: ${formatRupiah(day.omzet)}`}
            >
              <div
                className="w-full bg-[#2563EB] rounded-t-sm transition-all"
                style={{
                  height: `${(day.omzet / maxOmzet) * 100}%`,
                  minHeight: day.omzet > 0 ? '3px' : '0',
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute left-0 right-0 border-t border-dashed border-[#DC2626]/50"
          style={{
            bottom: `${(rataRata / maxOmzet) * 100}%`,
          }}
        />
      </div>
      <p className="text-[10px] text-[#DC2626] text-right mt-1">
        - - - Rata-rata ({formatRupiah(rataRata)})
      </p>
    </Card>
  )
}

function getDaysInMonth(bulan: string): number {
  const [tahun, bulanNum] = bulan.split('-').map(Number)
  return new Date(tahun, bulanNum, 0).getDate()
}
