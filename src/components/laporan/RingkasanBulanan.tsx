'use client'

import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface RingkasanBulananCardsProps {
  totalPemasukan: number
  labaKotor: number
  labaBersih: number
  sisaKas: number
  marginKotor: number
  marginBersih: number
}

export default function RingkasanBulananCards({
  totalPemasukan,
  labaKotor,
  labaBersih,
  sisaKas,
  marginKotor,
  marginBersih,
}: RingkasanBulananCardsProps) {
  const cards = [
    {
      label: 'Total Uang Masuk',
      value: formatRupiah(totalPemasukan),
      color: 'text-[#16A34A]',
      tooltip: 'Total semua pemasukan bulan ini',
    },
    {
      label: 'Laba Kotor',
      value: `${formatRupiah(labaKotor)} (${marginKotor.toFixed(0)}%)`,
      color: 'text-[#0F172A]',
      tooltip: TOOLTIP_ISTILAH.labaKotor,
    },
    {
      label: 'Laba Bersih',
      value: `${formatRupiah(labaBersih)} (${marginBersih.toFixed(0)}%)`,
      color: labaBersih >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]',
      tooltip: TOOLTIP_ISTILAH.labaBersih,
    },
    {
      label: 'Sisa Kas',
      value: formatRupiah(sisaKas),
      color: sisaKas >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]',
      tooltip: TOOLTIP_ISTILAH.sisaKas,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <Card key={i} padding="sm">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-[#64748B]">{card.label}</p>
            <Tooltip text={card.tooltip} />
          </div>
          <p className={`text-base font-bold tabular-nums ${card.color}`}>
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  )
}
