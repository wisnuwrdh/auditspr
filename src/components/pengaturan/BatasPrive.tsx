'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import { TOOLTIP_ISTILAH } from '@/lib/constants'

interface BatasPriveSettingsProps {
  batasPrive: number
  onSave: (batas: number) => Promise<void>
}

export default function BatasPriveSettings({ batasPrive, onSave }: BatasPriveSettingsProps) {
  const [batas, setBatas] = useState(String(batasPrive))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await onSave(parseInt(batas) || 0)
      setMessage('Berhasil disimpan')
    } catch {
      setMessage('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-1 mb-3">
        <p className="text-sm font-medium text-[#0F172A]">Batas Penarikan Keluarga</p>
        <Tooltip text={TOOLTIP_ISTILAH.prive} />
      </div>
      <div className="space-y-3">
        <Input
          label="Batas per bulan"
          prefix="Rp"
          type="number"
          inputMode="numeric"
          value={batas}
          onChange={(e) => setBatas(e.target.value)}
          placeholder="1000000"
        />
        {message && (
          <p className={`text-sm ${message === 'Berhasil disimpan' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {message}
          </p>
        )}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Batas'}
        </Button>
      </div>
    </Card>
  )
}
