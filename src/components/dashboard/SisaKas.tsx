'use client'

import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface SisaKasProps {
  sisaKas: number
}

export default function SisaKas({ sisaKas }: SisaKasProps) {
  const isNegative = sisaKas < 0

  return (
    <Card>
      <div className="flex items-center gap-1 mb-2">
        <p className="text-sm text-[#64748B]">Uang di kas bisnis sekarang</p>
        <Tooltip text={TOOLTIP_ISTILAH.sisaKas} />
      </div>
      <p className={`text-3xl font-bold tabular-nums ${isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
        {formatRupiah(sisaKas)}
      </p>
    </Card>
  )
}
