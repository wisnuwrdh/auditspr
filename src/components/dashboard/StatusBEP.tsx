'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface StatusBEPProps {
  totalPemasukan: number
  totalBiaya: number
}

export default function StatusBEP({ totalPemasukan, totalBiaya }: StatusBEPProps) {
  const sudahBEP = totalPemasukan >= totalBiaya
  const kurang = totalBiaya - totalPemasukan

  return (
    <Card>
      <div className="flex items-center gap-1 mb-2">
        <p className="text-sm text-[#64748B]">Status modal hari ini</p>
        <Tooltip text={TOOLTIP_ISTILAH.bep} />
      </div>
      {sudahBEP ? (
        <Badge variant="success">Sudah balik modal</Badge>
      ) : (
        <div>
          <Badge variant="danger">Belum balik modal</Badge>
          <p className="text-xs text-[#64748B] mt-1">
            Kurang {formatRupiah(kurang)}
          </p>
        </div>
      )}
    </Card>
  )
}
