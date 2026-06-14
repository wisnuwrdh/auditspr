'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SisaKas from '@/components/dashboard/SisaKas'
import StatusTarget from '@/components/dashboard/StatusTarget'
import StatusBEP from '@/components/dashboard/StatusBEP'
import RingkasanHarianCard from '@/components/dashboard/RingkasanHarian'
import GrafikTren from '@/components/dashboard/GrafikTren'
import BatasPrive from '@/components/dashboard/BatasPrive'
import InsightMingguan from '@/components/dashboard/InsightMingguan'
import BackupReminder from '@/components/dashboard/BackupReminder'
import { getAllTransaksi } from '@/lib/db/transaksi'
import { getAllKategori } from '@/lib/db/kategori'
import { getPengaturan, savePengaturan } from '@/lib/db/pengaturan'
import { hitungRingkasanHarian } from '@/lib/utils/hitung'
import { getTodayISO, formatTanggal } from '@/lib/utils/format'
import type { Transaksi, Pengaturan, RingkasanHarian, TargetHarian } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [ringkasan, setRingkasan] = useState<RingkasanHarian | null>(null)
  const [allTransaksi, setAllTransaksi] = useState<Transaksi[]>([])
  const [totalPriveBulan, setTotalPriveBulan] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const [transaksi, pengaturanData, kats] = await Promise.all([
          getAllTransaksi(),
          getPengaturan(),
          getAllKategori(),
        ])
        setPengaturan(pengaturanData)

        const today = getTodayISO()
        const transHariIni = transaksi.filter(t => t.tanggal === today)
        const ringkasanHarian = hitungRingkasanHarian(transHariIni, kats)
        setRingkasan(ringkasanHarian)

        setAllTransaksi(transaksi)

        const currentMonth = today.substring(0, 7)
        const priveBulan = transaksi
          .filter(t => t.tanggal.startsWith(currentMonth) && t.jenis === 'prive')
          .reduce((sum, t) => sum + t.nominal, 0)
        setTotalPriveBulan(priveBulan)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveTarget = async (target: TargetHarian) => {
    if (!pengaturan) return
    await savePengaturan({ ...pengaturan, targetHarian: target })
    setPengaturan(prev => prev ? { ...prev, targetHarian: target } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[#64748B] font-medium">Memuat data...</p>
          <p className="text-xs text-[#94A3B8] mt-1">Menyiapkan dashboard</p>
        </div>
      </div>
    )
  }

  const today = getTodayISO()
  const totalBiayaHariIni = (ringkasan?.totalHPP || 0) +
    (ringkasan?.totalStokPendukung || 0) +
    (ringkasan?.totalOpsTetap || 0) +
    (ringkasan?.totalOpsVariabel || 0)

  const hasDataToday = ringkasan && (ringkasan.totalPemasukan > 0 || totalBiayaHariIni > 0 || ringkasan.totalPrive > 0)

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title={pengaturan?.namaBisnis || 'Bisnis Saya'}
        subtitle={formatTanggal(today)}
        action={
          <Button
            size="sm"
            onClick={() => router.push('/catat')}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} />
            Catat
          </Button>
        }
      />

      <BackupReminder />

      {!hasDataToday && (
        <Card>
          <div className="text-center py-6">
            <p className="text-base font-semibold text-[#0F172A]">Belum ada catatan hari ini</p>
            <p className="text-sm text-[#64748B] mt-1 mb-4">Mulai catat pemasukan atau pengeluaran sekarang</p>
            <Button onClick={() => router.push('/catat')} className="mx-auto">
              <PlusCircle size={18} className="mr-1" />
              Catat Sekarang
            </Button>
          </div>
        </Card>
      )}

      {ringkasan && (
        <SisaKas sisaKas={ringkasan.sisaKas} />
      )}

      {pengaturan && ringkasan && (
        <StatusTarget
          target={pengaturan.targetHarian}
          aktual={ringkasan.totalPemasukan}
          onSaveTarget={handleSaveTarget}
        />
      )}

      {ringkasan && (
        <StatusBEP
          totalPemasukan={ringkasan.totalPemasukan}
          totalBiaya={totalBiayaHariIni}
        />
      )}

      {ringkasan && (
        <RingkasanHarianCard
          totalPemasukan={ringkasan.totalPemasukan}
          totalBiaya={totalBiayaHariIni}
          laba={ringkasan.labaBersih}
        />
      )}

      <InsightMingguan transaksi={allTransaksi} />

      <GrafikTren transaksi={allTransaksi} />

      {pengaturan && (
        <BatasPrive
          totalPrive={totalPriveBulan}
          batasPrive={pengaturan.batasPrive}
        />
      )}
    </div>
  )
}
