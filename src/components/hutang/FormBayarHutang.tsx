'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { addPembayaranHutang } from '@/lib/db/hutang'
import { getTodayISO } from '@/lib/utils/format'

interface FormBayarHutangProps {
  hutangId: string
  sisaHutang: number
  onSuccess: () => void
  onCancel: () => void
}

export default function FormBayarHutang({ hutangId, sisaHutang, onSuccess, onCancel }: FormBayarHutangProps) {
  const [nominal, setNominal] = useState('')
  const [tanggal, setTanggal] = useState(getTodayISO())
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nominalNum = parseInt(nominal.replace(/\./g, ''))
    if (!nominalNum || nominalNum <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }
    if (nominalNum > sisaHutang) {
      setError(`Sisa hutang hanya ${sisaHutang.toLocaleString('id-ID')}`)
      return
    }

    setLoading(true)
    try {
      await addPembayaranHutang(hutangId, nominalNum, tanggal, catatan.trim() || undefined)
      onSuccess()
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nominal bayar"
        prefix="Rp"
        type="text"
        inputMode="numeric"
        value={nominal}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '')
          setNominal(val ? parseInt(val).toLocaleString('id-ID') : '')
        }}
        placeholder="0"
      />

      <div>
        <label className="block text-sm font-medium text-[#64748B] mb-1.5">Tanggal bayar</label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent min-h-[44px]"
        />
      </div>

      <Input
        label="Catatan (opsional)"
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Misal: Pembayaran ke-2"
      />

      <p className="text-xs text-[#64748B]">
        Sisa hutang: Rp {sisaHutang.toLocaleString('id-ID')}
      </p>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Menyimpan...' : 'Bayar'}
        </Button>
      </div>
    </form>
  )
}
