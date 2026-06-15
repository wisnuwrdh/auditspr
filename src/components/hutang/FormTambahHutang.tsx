'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { addHutang } from '@/lib/db/hutang'
import { getTodayISO } from '@/lib/utils/format'
import type { JenisHutang } from '@/types'

interface FormTambahHutangProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function FormTambahHutang({ onSuccess, onCancel }: FormTambahHutangProps) {
  const [namaKreditur, setNamaKreditur] = useState('')
  const [jenisHutang, setJenisHutang] = useState<JenisHutang>('operasional')
  const [totalHutang, setTotalHutang] = useState('')
  const [catatan, setCatatan] = useState('')
  const [tanggalHutang, setTanggalHutang] = useState(getTodayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!namaKreditur.trim()) {
      setError('Masukkan nama kreditur')
      return
    }
    const nominal = parseInt(totalHutang.replace(/\./g, ''))
    if (!nominal || nominal <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }

    setLoading(true)
    try {
      await addHutang({
        namaKreditur: namaKreditur.trim(),
        jenisHutang,
        totalHutang: nominal,
        catatan: catatan.trim() || undefined,
        tanggalHutang,
      })
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
        label="Nama kreditur"
        type="text"
        value={namaKreditur}
        onChange={(e) => setNamaKreditur(e.target.value)}
        placeholder="Misal: Supplier Tepung"
      />

      <div>
        <label className="block text-sm font-medium text-[#64748B] mb-1.5">Jenis hutang</label>
        <div className="flex gap-2">
          {[
            { value: 'modal', label: 'Modal Awal' },
            { value: 'operasional', label: 'Operasional' },
          ].map(j => (
            <button
              key={j.value}
              type="button"
              onClick={() => setJenisHutang(j.value as JenisHutang)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                jenisHutang === j.value
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'bg-[#F8F9FA] border-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Total hutang"
        prefix="Rp"
        type="text"
        inputMode="numeric"
        value={totalHutang}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '')
          setTotalHutang(val ? parseInt(val).toLocaleString('id-ID') : '')
        }}
        placeholder="0"
      />

      <div>
        <label className="block text-sm font-medium text-[#64748B] mb-1.5">Tanggal hutang</label>
        <input
          type="date"
          value={tanggalHutang}
          onChange={(e) => setTanggalHutang(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent min-h-[44px]"
        />
      </div>

      <Input
        label="Catatan (opsional)"
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Misal: Jatuh tempo 2 minggu"
      />

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Hutang'}
        </Button>
      </div>
    </form>
  )
}
