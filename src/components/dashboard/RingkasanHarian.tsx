'use client'

import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface RingkasanHarianCardProps {
  totalPemasukan: number
  totalBiaya: number
  laba: number
}

export default function RingkasanHarianCard({ totalPemasukan, totalBiaya, laba }: RingkasanHarianCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-[#64748B] mb-3">Ringkasan hari ini</p>
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#64748B]">Uang masuk</span>
          <span className="text-sm font-semibold text-[#16A34A]">{formatRupiah(totalPemasukan)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#64748B]">Bahan & pengeluaran</span>
          <span className="text-sm font-semibold text-[#DC2626]">{formatRupiah(totalBiaya)}</span>
        </div>
        <div className="border-t border-[#E2E8F0] pt-2 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#0F172A]">Laba hari ini</span>
            <Tooltip text={TOOLTIP_ISTILAH.labaBersih} />
          </div>
          <span className={`text-sm font-bold ${laba >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {formatRupiah(laba)}
          </span>
        </div>
      </div>
    </Card>
  )
}
