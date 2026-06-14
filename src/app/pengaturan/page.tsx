'use client'

import { useState, useEffect, useCallback } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import KategoriManager from '@/components/pengaturan/KategoriManager'
import TargetHarianSettings from '@/components/pengaturan/TargetHarian'
import BatasPriveSettings from '@/components/pengaturan/BatasPrive'
import BackupRestore from '@/components/pengaturan/BackupRestore'
import { getPengaturan, savePengaturan } from '@/lib/db/pengaturan'
import { getAllKategori } from '@/lib/db/kategori'
import type { Pengaturan, Kategori, TargetHarian } from '@/types'

export default function PengaturanPage() {
  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [namaBisnis, setNamaBisnis] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [peng, kats] = await Promise.all([
        getPengaturan(),
        getAllKategori(),
      ])
      setPengaturan(peng)
      setNamaBisnis(peng.namaBisnis)
      setKategori(kats)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveNama = async () => {
    if (!pengaturan) return
    setSaving(true)
    setMessage('')
    try {
      await savePengaturan({ ...pengaturan, namaBisnis: namaBisnis.trim() || 'Bisnis Saya' })
      setMessage('Nama bisnis disimpan')
    } catch {
      setMessage('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTarget = async (target: TargetHarian) => {
    if (!pengaturan) return
    await savePengaturan({ ...pengaturan, targetHarian: target })
    setPengaturan(prev => prev ? { ...prev, targetHarian: target } : prev)
  }

  const handleSaveBatasPrive = async (batas: number) => {
    if (!pengaturan) return
    await savePengaturan({ ...pengaturan, batasPrive: batas })
    setPengaturan(prev => prev ? { ...prev, batasPrive: batas } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#64748B]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <PageHeader title="Pengaturan" />

      <Card>
        <p className="text-sm font-medium text-[#0F172A] mb-3">Bisnis</p>
        <div className="space-y-3">
          <Input
            label="Nama Bisnis"
            value={namaBisnis}
            onChange={(e) => setNamaBisnis(e.target.value)}
            placeholder="Nama bisnis kamu"
          />
          {message && (
            <p className={`text-sm ${message === 'Nama bisnis disimpan' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {message}
            </p>
          )}
          <Button size="sm" onClick={handleSaveNama} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </Card>

      {pengaturan && (
        <>
          <TargetHarianSettings
            target={pengaturan.targetHarian}
            onSave={handleSaveTarget}
          />
          <BatasPriveSettings
            batasPrive={pengaturan.batasPrive}
            onSave={handleSaveBatasPrive}
          />
        </>
      )}

      <KategoriManager kategori={kategori} onRefresh={() => getAllKategori().then(setKategori)} />
      <BackupRestore />

      <Card>
        <p className="text-sm font-medium text-[#0F172A] mb-1">Tentang</p>
        <p className="text-xs text-[#64748B] mb-2">CashFlow UMKM v1.0</p>
        <p className="text-xs text-[#64748B] bg-[#EFF6FF] p-2.5 rounded-lg">
          Data tersimpan di HP kamu. Tidak dikirim ke mana-mana.
        </p>
      </Card>
    </div>
  )
}
