'use client'

import { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { addTransaksi } from '@/lib/db/transaksi'
import { getAllTransaksi } from '@/lib/db/transaksi'
import { getPengaturan } from '@/lib/db/pengaturan'
import { getTodayISO, formatRupiah } from '@/lib/utils/format'
import type { Transaksi } from '@/types'

interface FormPriveProps {
  onSuccess: () => void
}

export default function FormPrive({ onSuccess }: FormPriveProps) {
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [tanggal, setTanggal] = useState(getTodayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [batasPrive, setBatasPrive] = useState(1000000)
  const [totalPriveBulan, setTotalPriveBulan] = useState(0)
  const [recentSuccess, setRecentSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const pengaturan = await getPengaturan()
      setBatasPrive(pengaturan.batasPrive)

      const all = await getAllTransaksi()
      const currentMonth = getTodayISO().substring(0, 7)
      const total = all
        .filter(t => t.tanggal.startsWith(currentMonth) && t.jenis === 'prive')
        .reduce((sum, t) => sum + t.nominal, 0)
      setTotalPriveBulan(total)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWarning('')

    const nominalNum = parseInt(nominal.replace(/\./g, ''))
    if (!nominalNum || nominalNum <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }

    const totalAfter = totalPriveBulan + nominalNum
    if (totalAfter > batasPrive) {
      setWarning(`Melebihi batas bulanan ${formatRupiah(batasPrive)}!`)
    } else if (totalAfter > batasPrive * 0.8) {
      setWarning(`Hampir mencapai batas bulanan ${formatRupiah(batasPrive)}`)
    }

    setLoading(true)
    try {
      const transaksi: Transaksi = {
        id: uuid(),
        tanggal,
        jenis: 'prive',
        kategoriId: 'prive',
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
      <p className="text-sm text-[#64748B] bg-[#EFF6FF] p-3 rounded-lg">
        Catat kalau ada uang bisnis yang dipakai untuk kebutuhan keluarga atau pribadi.
      </p>

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
        label="Berapa yang diambil?"
        prefix="Rp"
        type="text"
        inputMode="numeric"
        value={nominal}
        onChange={handleNominalChange}
        placeholder="0"
      />

      <Input
        label="Catatan (opsional)"
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Misal: beli sembako"
      />

      {warning && (
        <p className="text-sm text-[#D97706] bg-[#FFFBEB] p-2.5 rounded-lg">{warning}</p>
      )}

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      {recentSuccess && (
        <p className="text-sm text-[#16A34A] bg-[#F0FDF4] p-2.5 rounded-lg text-center">
          Tersimpan! Kamu bisa langsung catat lagi.
        </p>
      )}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </form>
  )
}
