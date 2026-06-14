'use client'

import Card from '@/components/ui/Card'
import { formatRupiah } from '@/lib/utils/format'

interface BatasPriveProps {
  totalPrive: number
  batasPrive: number
}

export default function BatasPrive({ totalPrive, batasPrive }: BatasPriveProps) {
  const persen = batasPrive > 0 ? (totalPrive / batasPrive) * 100 : 0
  const isWarning = persen > 80
  const isOver = persen >= 100

  const barColor = isOver
    ? 'bg-[#DC2626]'
    : isWarning
    ? 'bg-[#D97706]'
    : 'bg-[#2563EB]'

  return (
    <Card>
      <p className="text-sm text-[#64748B] mb-2">Penarikan keluarga bulan ini</p>
      <p className="text-lg font-semibold text-[#0F172A] mb-2">
        {formatRupiah(totalPrive)} dari {formatRupiah(batasPrive)}
      </p>
      <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(persen, 100)}%` }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-[#DC2626] mt-1 font-medium">
          Melebihi batas bulanan!
        </p>
      )}
      {isWarning && !isOver && (
        <p className="text-xs text-[#D97706] mt-1">
          Hampir mencapai batas bulanan
        </p>
      )}
    </Card>
  )
}
