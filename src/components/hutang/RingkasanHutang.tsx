'use client'

import Card from '@/components/ui/Card'
import { formatRupiah } from '@/lib/utils/format'

interface RingkasanHutangData {
  totalHutangAktif: number
  totalSudahDibayar: number
  totalSisaHutang: number
  jumlahKreditur: number
}

interface RingkasanHutangProps {
  data: RingkasanHutangData
}

export default function RingkasanHutang({ data }: RingkasanHutangProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-[#F0FDF4] border border-[#BBF7D0]">
        <p className="text-xs text-[#166534]">Sudah Dibayar</p>
        <p className="text-lg font-bold text-[#166534]">{formatRupiah(data.totalSudahDibayar)}</p>
      </Card>
      <Card className="bg-[#FEF2F2] border border-[#FECACA]">
        <p className="text-xs text-[#991B1B]">Sisa Hutang</p>
        <p className="text-lg font-bold text-[#991B1B]">{formatRupiah(data.totalSisaHutang)}</p>
      </Card>
      <Card>
        <p className="text-xs text-[#64748B]">Total Hutang</p>
        <p className="text-lg font-bold text-[#0F172A]">{formatRupiah(data.totalHutangAktif + data.totalSudahDibayar)}</p>
      </Card>
      <Card>
        <p className="text-xs text-[#64748B]">Jumlah Kreditur</p>
        <p className="text-lg font-bold text-[#0F172A]">{data.jumlahKreditur}</p>
      </Card>
    </div>
  )
}
