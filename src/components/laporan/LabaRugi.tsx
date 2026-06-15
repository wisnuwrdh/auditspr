'use client'

import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface LabaRugiProps {
  totalPemasukan: number
  totalHPP: number
  totalStokPendukung: number
  totalOpsTetap: number
  totalOpsVariabel: number
  totalPrive: number
  totalBayarHutang: number
  labaKotor: number
  labaBersih: number
  sisaKas: number
  marginKotor: number
  marginBersih: number
}

export default function LabaRugi({
  totalPemasukan,
  totalHPP,
  totalStokPendukung,
  totalOpsTetap,
  totalOpsVariabel,
  totalPrive,
  totalBayarHutang,
  labaKotor,
  labaBersih,
  sisaKas,
  marginKotor,
  marginBersih,
}: LabaRugiProps) {
  const row = (label: string, value: number, color?: string) => (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color || 'text-[#0F172A]'}`}>
        {formatRupiah(value)}
      </span>
    </div>
  )

  const separator = () => <div className="border-t border-[#E2E8F0] my-1" />

  return (
    <Card>
      <div className="flex items-center gap-1 mb-3">
        <p className="text-sm font-medium text-[#0F172A]">Laba Rugi</p>
        <Tooltip text="Laporan ini menunjukkan keuntungan bersih bisnis kamu" />
      </div>

      <div className="space-y-0.5">
        {row('Total Uang Masuk', totalPemasukan, '#16A34A')}
        {row('− Bahan baku (HPP)', totalHPP, '#DC2626')}
        {separator()}
        <div className="flex justify-between py-1.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#0F172A]">Laba Kotor</span>
            <Tooltip text={TOOLTIP_ISTILAH.labaKotor} />
          </div>
          <span className="text-sm font-bold text-[#0F172A] tabular-nums">
            {formatRupiah(labaKotor)} ({marginKotor.toFixed(0)}%)
          </span>
        </div>
        {separator()}

        <p className="text-xs text-[#64748B] pt-1 pb-0.5">Pengeluaran:</p>
        {row('− Perlengkapan', totalStokPendukung)}
        {row('− Tagihan rutin', totalOpsTetap)}
        {row('− Pengeluaran lainnya', totalOpsVariabel)}
        {separator()}

        <div className="flex justify-between py-1.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#0F172A]">Laba Bersih</span>
            <Tooltip text={TOOLTIP_ISTILAH.labaBersih} />
          </div>
          <span className={`text-sm font-bold tabular-nums ${labaBersih >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {formatRupiah(labaBersih)} ({marginBersih.toFixed(0)}%)
          </span>
        </div>
        {separator()}

        {row('− Diambil untuk keluarga', totalPrive, '#D97706')}
        {row('− Bayar hutang', totalBayarHutang, '#DC2626')}
        {separator()}

        <div className="flex justify-between py-1.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#0F172A]">Sisa di kas</span>
            <Tooltip text={TOOLTIP_ISTILAH.sisaKas} />
          </div>
          <span className={`text-sm font-bold tabular-nums ${sisaKas >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {formatRupiah(sisaKas)}
          </span>
        </div>
      </div>
    </Card>
  )
}
