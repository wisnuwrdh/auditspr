'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { getAllKategori } from '@/lib/db/kategori'
import type { Kategori, Transaksi } from '@/types'
import FormPemasukan from '@/components/catat/FormPemasukan'
import FormPengeluaran from '@/components/catat/FormPengeluaran'
import FormPrive from '@/components/catat/FormPrive'
import RiwayatTransaksi from '@/components/catat/RiwayatTransaksi'
import { getTransaksiByTanggal, deleteTransaksi } from '@/lib/db/transaksi'
import { getTodayISO, formatTanggal } from '@/lib/utils/format'

type Tab = 'pemasukan' | 'pengeluaran' | 'prive'

export default function CatatPage() {
  const [tab, setTab] = useState<Tab>('pemasukan')
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [riwayat, setRiwayat] = useState<Transaksi[]>([])
  const [tanggal, setTanggal] = useState(getTodayISO())

  const loadData = useCallback(async () => {
    const kats = await getAllKategori()
    setKategori(kats)
    const trans = await getTransaksiByTanggal(tanggal)
    setRiwayat(trans.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [tanggal])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSuccess = () => {
    loadData()
  }

  const handleDelete = async (id: string) => {
    await deleteTransaksi(id)
    loadData()
  }

  const navigateDate = (direction: -1 | 1) => {
    const d = new Date(tanggal + 'T00:00:00')
    d.setDate(d.getDate() + direction)
    setTanggal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const isToday = tanggal === getTodayISO()

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pemasukan', label: 'Pemasukan' },
    { key: 'pengeluaran', label: 'Pengeluaran' },
    { key: 'prive', label: 'Ambil untuk Keluarga' },
  ]

  return (
    <div className="space-y-4 pb-6">
      <PageHeader title="Catat Transaksi" />

      <div className="flex items-center justify-between bg-white rounded-xl border border-[#E2E8F0] px-4 py-3">
        <button onClick={() => navigateDate(-1)} className="p-1 text-[#64748B] hover:text-[#0F172A]">
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setTanggal(getTodayISO())}
          className="flex-1 text-center"
        >
          <p className={`text-base font-semibold ${isToday ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
            {formatTanggal(tanggal)}
          </p>
          {!isToday && (
            <span className="text-xs text-[#2563EB]">Kembali ke hari ini</span>
          )}
        </button>
        <button onClick={() => navigateDate(1)} className="p-1 text-[#64748B] hover:text-[#0F172A]">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex border-b border-[#E2E8F0]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 -mb-[1px] ${
              tab === t.key
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-1">
        {tab === 'pemasukan' && (
          <FormPemasukan kategori={kategori.filter(k => k.jenis === 'pemasukan')} onSuccess={handleSuccess} />
        )}
        {tab === 'pengeluaran' && (
          <FormPengeluaran kategori={kategori.filter(k => k.jenis !== 'pemasukan')} onSuccess={handleSuccess} />
        )}
        {tab === 'prive' && (
          <FormPrive onSuccess={handleSuccess} />
        )}
      </div>

      <div className="pt-2">
        <RiwayatTransaksi transaksi={riwayat} onDelete={handleDelete} onEdit={handleSuccess} />
      </div>
    </div>
  )
}
