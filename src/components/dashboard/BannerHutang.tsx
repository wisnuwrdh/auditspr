'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatRupiah } from '@/lib/utils/format'

interface BannerHutangProps {
  totalSisa: number
  jumlahKreditur: number
}

export default function BannerHutang({ totalSisa, jumlahKreditur }: BannerHutangProps) {
  if (totalSisa <= 0) return null

  return (
    <Link href="/hutang">
      <Card className="bg-gradient-to-r from-[#FEF2F2] to-[#FFF7ED] border border-[#FECACA] cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-[#DC2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#991B1B]">
              Tagihan hutang aktif
            </p>
            <p className="text-xs text-[#B91C1C] mt-0.5">
              {formatRupiah(totalSisa)} sisa dari {jumlahKreditur} kreditur
            </p>
          </div>
          <span className="text-xs text-[#DC2626] font-medium">Atur &rarr;</span>
        </div>
      </Card>
    </Link>
  )
}
