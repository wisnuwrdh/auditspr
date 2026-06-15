'use client'

import { useState, useEffect } from 'react'
import { getPembayaranByHutang, deletePembayaranHutang } from '@/lib/db/hutang'
import { formatRupiah, formatTanggal } from '@/lib/utils/format'
import type { PembayaranHutang } from '@/types'

interface RiwayatPembayaranProps {
  hutangId: string
}

export default function RiwayatPembayaran({ hutangId }: RiwayatPembayaranProps) {
  const [pembayaran, setPembayaran] = useState<PembayaranHutang[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hutangId])

  const load = async () => {
    setLoading(true)
    const data = await getPembayaranByHutang(hutangId)
    setPembayaran(data.sort((a, b) => b.tanggal.localeCompare(a.tanggal)))
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deletePembayaranHutang(id, hutangId)
    load()
  }

  if (loading) {
    return <p className="text-xs text-[#64748B]">Memuat riwayat...</p>
  }

  if (pembayaran.length === 0) {
    return <p className="text-xs text-[#64748B]">Belum ada pembayaran</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#64748B]">Riwayat Pembayaran</p>
      {pembayaran.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-3 py-2">
          <div>
            <p className="text-sm font-medium text-[#0F172A]">{formatRupiah(p.nominal)}</p>
            <p className="text-xs text-[#64748B]">{formatTanggal(p.tanggal)}{p.catatan ? ` · ${p.catatan}` : ''}</p>
          </div>
          <button
            onClick={() => handleDelete(p.id)}
            className="text-xs text-[#DC2626] hover:underline"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  )
}
