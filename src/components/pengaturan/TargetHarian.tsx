'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatRupiah } from '@/lib/utils/format'
import type { TargetHarian } from '@/types'

interface TargetHarianProps {
  target: TargetHarian
  onSave: (target: TargetHarian) => Promise<void>
}

export default function TargetHarianSettings({ target, onSave }: TargetHarianProps) {
  const [jumlahPorsi, setJumlahPorsi] = useState(String(target.jumlahPorsi))
  const [hargaPerPorsi, setHargaPerPorsi] = useState(String(target.hargaPerPorsi))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const jumlah = parseInt(jumlahPorsi) || 0
  const harga = parseInt(hargaPerPorsi) || 0
  const omzetTarget = jumlah * harga

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await onSave({
        jumlahPorsi: jumlah,
        hargaPerPorsi: harga,
      })
      setMessage('Berhasil disimpan')
    } catch {
      setMessage('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium text-[#0F172A] mb-3">Target Harian</p>
      <div className="space-y-3">
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
          Target omzet harian:{' '}
          <span className="font-semibold text-[#0F172A]">{formatRupiah(omzetTarget)}</span>
        </p>
        {message && (
          <p className={`text-sm ${message === 'Berhasil disimpan' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {message}
          </p>
        )}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Target'}
        </Button>
      </div>
    </Card>
  )
}
