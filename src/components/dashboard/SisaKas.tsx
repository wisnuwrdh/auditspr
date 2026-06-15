'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { formatRupiah } from '@/lib/utils/format'
import { TOOLTIP_ISTILAH } from '@/lib/constants'
import { getModalAwal } from '@/lib/db/pengaturan'
import { getAllTransaksi } from '@/lib/db/transaksi'
import { getAllKategori } from '@/lib/db/kategori'
import { hitungSisaKasTotal } from '@/lib/utils/hitung'

interface SisaKasProps {
  sisaKas: number
}

export default function SisaKas({ sisaKas }: SisaKasProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [kasTotal, setKasTotal] = useState(sisaKas)

  useEffect(() => {
    async function load() {
      try {
        const [modalAwal, transaksi, kategori] = await Promise.all([
          getModalAwal(),
          getAllTransaksi(),
          getAllKategori(),
        ])
        const total = hitungSisaKasTotal(modalAwal, transaksi, kategori)
        setKasTotal(total)
      } catch {
        setKasTotal(sisaKas)
      }
    }
    if (sisaKas >= 0) load()
  }, [sisaKas])

  return (
    <Card className="bg-[#2563EB] text-white border-[#2563EB]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-xs text-white/80">Sisa Kas</p>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="w-4 h-4 rounded-full bg-white/20 text-white/80 text-xs flex items-center justify-center font-bold"
            >
              ?
            </button>
          </div>
          <p className="text-2xl font-bold text-white mt-0.5">{formatRupiah(kasTotal)}</p>
        </div>
      </div>
      {showTooltip && (
        <div className="mt-2 p-2 bg-white/10 rounded-lg">
          <p className="text-xs text-white/90">{TOOLTIP_ISTILAH.sisaKas}</p>
        </div>
      )}
    </Card>
  )
}
