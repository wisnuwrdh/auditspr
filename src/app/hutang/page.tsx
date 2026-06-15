'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusCircle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import RingkasanHutang from '@/components/hutang/RingkasanHutang'
import KartuHutang from '@/components/hutang/KartuHutang'
import FormTambahHutang from '@/components/hutang/FormTambahHutang'
import { getAllHutang, getRingkasanHutang } from '@/lib/db/hutang'
import type { Hutang, RingkasanHutang as RingkasanHutangType } from '@/types'

export default function HutangPage() {
  const [hutang, setHutang] = useState<Hutang[]>([])
  const [ringkasan, setRingkasan] = useState<RingkasanHutangType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [allHutang, ringkasanData] = await Promise.all([
        getAllHutang(),
        getRingkasanHutang(),
      ])
      setHutang(allHutang.sort((a, b) => a.tanggalHutang.localeCompare(b.tanggalHutang) * -1))
      setRingkasan(ringkasanData)
    } catch (err) {
      console.error('Failed to load hutang:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeHutang = hutang.filter(h => h.status === 'aktif')
  const riwayatHutang = hutang.filter(h => h.status !== 'aktif')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[#64748B] font-medium">Memuat data...</p>
          <p className="text-xs text-[#94A3B8] mt-1">Menyiapkan data hutang</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Hutang"
        action={
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} />
            {showForm ? 'Batal' : 'Tambah'}
          </Button>
        }
      />

      {ringkasan && <RingkasanHutang data={ringkasan} />}

      {showForm && (
        <FormTambahHutang
          onSuccess={() => { setShowForm(false); loadData() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {activeHutang.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#64748B] mb-3">Hutang Aktif</h2>
          <div className="space-y-3">
            {activeHutang.map(h => (
              <KartuHutang key={h.id} hutang={h} onUpdate={loadData} />
            ))}
          </div>
        </div>
      )}

      {activeHutang.length === 0 && !showForm && (
        <div className="text-center py-10">
          <p className="text-base font-semibold text-[#0F172A]">Belum ada hutang</p>
          <p className="text-sm text-[#64748B] mt-1 mb-4">Catat hutang usaha kamu di sini</p>
          <Button onClick={() => setShowForm(true)} className="mx-auto">
            <PlusCircle size={18} className="mr-1" />
            Catat Hutang Baru
          </Button>
        </div>
      )}

      {riwayatHutang.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#64748B] mb-3 mt-2">Riwayat Lunas</h2>
          <div className="space-y-3">
            {riwayatHutang.map(h => (
              <KartuHutang key={h.id} hutang={h} onUpdate={loadData} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
