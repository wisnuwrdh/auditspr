'use client'

import { useState } from 'react'
import { Trash2, Wallet } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import RiwayatPembayaran from './RiwayatPembayaran'
import FormBayarHutang from './FormBayarHutang'
import { formatRupiah, formatTanggal } from '@/lib/utils/format'
import { deleteHutang } from '@/lib/db/hutang'
import type { Hutang } from '@/types'

interface KartuHutangProps {
  hutang: Hutang
  onUpdate: () => void
}

export default function KartuHutang({ hutang, onUpdate }: KartuHutangProps) {
  const [showBayar, setShowBayar] = useState(false)
  const [showRiwayat, setShowRiwayat] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pctLunas = hutang.totalHutang > 0
    ? (hutang.totalDibayar / hutang.totalHutang) * 100
    : 0

  const statusLabel = hutang.status === 'lunas' ? 'Lunas' : hutang.status === 'dihapuskan' ? 'Dihapus' : 'Aktif'
  const statusColor = hutang.status === 'lunas'
    ? 'bg-[#BBF7D0] text-[#166534]'
    : hutang.status === 'dihapuskan'
      ? 'bg-[#E2E8F0] text-[#64748B]'
      : 'bg-[#FEF9C3] text-[#854D0E]'

  const handleDelete = async () => {
    await deleteHutang(hutang.id)
    onUpdate()
  }

  return (
    <Card className={hutang.status === 'lunas' ? 'opacity-75' : ''}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#0F172A] truncate">{hutang.namaKreditur}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            {hutang.jenisHutang === 'modal' ? 'Modal Awal' : 'Operasional'} &middot; {formatTanggal(hutang.tanggalHutang)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-xs text-[#64748B]">Total</p>
          <p className="text-sm font-bold text-[#0F172A]">{formatRupiah(hutang.totalHutang)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Dibayar</p>
          <p className="text-sm font-bold text-[#166534]">{formatRupiah(hutang.totalDibayar)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Sisa</p>
          <p className="text-sm font-bold text-[#DC2626]">{formatRupiah(hutang.sisaHutang)}</p>
        </div>
      </div>

      {hutang.status === 'aktif' && (
        <ProgressBar
          value={hutang.totalDibayar}
          max={hutang.totalHutang}
          color={pctLunas > 50 ? '#16A34A' : '#2563EB'}
          height={6}
        />
      )}

      {hutang.catatan && (
        <p className="text-xs text-[#64748B] mt-2">{hutang.catatan}</p>
      )}

      <div className="flex gap-2 mt-3">
        {hutang.status === 'aktif' && (
          <Button size="sm" onClick={() => setShowBayar(!showBayar)} className="flex items-center gap-1">
            <Wallet size={14} />
            Bayar
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setShowRiwayat(!showRiwayat)}>
          Riwayat
        </Button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="ml-auto p-2 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[#64748B] px-2 py-1"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-[#DC2626] font-medium px-2 py-1"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {showBayar && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <FormBayarHutang
            hutangId={hutang.id}
            sisaHutang={hutang.sisaHutang}
            onSuccess={() => { setShowBayar(false); onUpdate() }}
            onCancel={() => setShowBayar(false)}
          />
        </div>
      )}

      {showRiwayat && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <RiwayatPembayaran hutangId={hutang.id} />
        </div>
      )}
    </Card>
  )
}
