'use client'

import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import KategoriPicker from '@/components/ui/KategoriPicker'
import { addTransaksi } from '@/lib/db/transaksi'
import { getTodayISO } from '@/lib/utils/format'
import type { Kategori, Transaksi } from '@/types'

interface FormPemasukanProps {
  kategori: Kategori[]
  onSuccess: () => void
}

export default function FormPemasukan({ kategori, onSuccess }: FormPemasukanProps) {
  const [nominal, setNominal] = useState('')
  const [kategoriId, setKategoriId] = useState(kategori[0]?.id || '')
  const [catatan, setCatatan] = useState('')
  const [tanggal, setTanggal] = useState(getTodayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [recentSuccess, setRecentSuccess] = useState(false)

  const selectedKategori = kategori.find(k => k.id === kategoriId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nominalNum = parseInt(nominal.replace(/\./g, ''))
    if (!nominalNum || nominalNum <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }
    if (!kategoriId) {
      setError('Pilih kategori')
      return
    }

    setLoading(true)
    try {
      const transaksi: Transaksi = {
        id: uuid(),
        tanggal,
        jenis: 'pemasukan',
        kategoriId,
        nominal: nominalNum,
        catatan: catatan || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await addTransaksi(transaksi)
      setNominal('')
      setCatatan('')
      setRecentSuccess(true)
      setTimeout(() => setRecentSuccess(false), 2000)
      onSuccess()
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setNominal(val ? parseInt(val).toLocaleString('id-ID') : '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#64748B] mb-1.5">Tanggal</label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent min-h-[44px]"
        />
      </div>

      <Input
        label="Berapa uang yang masuk?"
        prefix="Rp"
        type="text"
        inputMode="numeric"
        value={nominal}
        onChange={handleNominalChange}
        placeholder="0"
      />

      <div>
        <label className="block text-sm font-medium text-[#64748B] mb-1.5">Dari mana?</label>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-left min-h-[44px] hover:border-[#BFDBFE] transition-colors"
        >
          <span className={selectedKategori ? 'text-[#0F172A]' : 'text-[#94A3B8]'}>
            {selectedKategori?.nama || 'Pilih kategori'}
          </span>
          <ChevronDown size={16} className="text-[#64748B]" />
        </button>
      </div>

      <Input
        label="Catatan (opsional)"
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Misal: pesanan catering"
      />

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      {recentSuccess && (
        <p className="text-sm text-[#16A34A] bg-[#F0FDF4] p-2.5 rounded-lg text-center">
          Tersimpan! Kamu bisa langsung catat lagi.
        </p>
      )}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Pemasukan'}
      </Button>

      {showPicker && (
        <KategoriPicker
          kategori={kategori}
          selectedId={kategoriId}
          onSelect={(id) => setKategoriId(id)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </form>
  )
}
