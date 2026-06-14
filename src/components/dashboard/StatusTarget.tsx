'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { formatRupiah } from '@/lib/utils/format'
import type { TargetHarian } from '@/types'

interface StatusTargetProps {
  target: TargetHarian
  aktual: number
  onSaveTarget: (target: TargetHarian) => Promise<void>
}

export default function StatusTarget({ target, aktual, onSaveTarget }: StatusTargetProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [jumlahPorsi, setJumlahPorsi] = useState(String(target.jumlahPorsi))
  const [hargaPerPorsi, setHargaPerPorsi] = useState(String(target.hargaPerPorsi))
  const [saving, setSaving] = useState(false)

  const omzetTarget = target.jumlahPorsi * target.hargaPerPorsi
  const persen = omzetTarget > 0 ? Math.min((aktual / omzetTarget) * 100, 100) : 0
  const hasInput = aktual > 0

  const handleOverride = async () => {
    setSaving(true)
    try {
      await onSaveTarget({
        jumlahPorsi: parseInt(jumlahPorsi) || 0,
        hargaPerPorsi: parseInt(hargaPerPorsi) || 0,
      })
      setShowModal(false)
    } catch {} finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-[#64748B]">Target hari ini</p>
          <button
            onClick={() => {
              setJumlahPorsi(String(target.jumlahPorsi))
              setHargaPerPorsi(String(target.hargaPerPorsi))
              setShowModal(true)
            }}
            className="p-1 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
        {hasInput ? (
          <>
            <p className="text-lg font-semibold text-[#0F172A] mb-1">
              {formatRupiah(aktual)} dari {formatRupiah(omzetTarget)}
            </p>
            <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${persen}%` }}
              />
            </div>
            <p className="text-xs text-[#64748B] mt-1">{Math.round(persen)}% tercapai</p>
          </>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-[#64748B] mb-3">Belum ada catatan hari ini</p>
            <Button size="sm" onClick={() => router.push('/catat')}>
              Catat Pemasukan
            </Button>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ubah Target Harian">
        <div className="space-y-4">
          <Input
            label="Jumlah porsi target"
            type="number"
            inputMode="numeric"
            value={jumlahPorsi}
            onChange={(e) => setJumlahPorsi(e.target.value)}
            placeholder="10"
          />
          <Input
            label="Harga per porsi"
            prefix="Rp"
            type="number"
            inputMode="numeric"
            value={hargaPerPorsi}
            onChange={(e) => setHargaPerPorsi(e.target.value)}
            placeholder="10000"
          />
          <p className="text-sm text-[#64748B]">
            Target omzet: <span className="font-semibold text-[#0F172A]">
              {formatRupiah((parseInt(jumlahPorsi) || 0) * (parseInt(hargaPerPorsi) || 0))}
            </span>
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>Batal</Button>
            <Button fullWidth onClick={handleOverride} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
