'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { getModalAwal, saveModalAwal } from '@/lib/db/pengaturan'
import { formatRupiah } from '@/lib/utils/format'
import type { ModalAwal } from '@/types'

interface ModalAwalSetupProps {
  onSaved?: () => void
}

export default function ModalAwalSetup({ onSaved }: ModalAwalSetupProps) {
  const [modalAwal, setModalAwal] = useState<ModalAwal | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirmEdit, setConfirmEdit] = useState(false)
  const [totalModal, setTotalModal] = useState('')
  const [dariSendiri, setDariSendiri] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const data = await getModalAwal()
    setModalAwal(data)
    setLoading(false)
  }

  const total = parseInt(totalModal.replace(/\./g, '')) || 0
  const sendiri = parseInt(dariSendiri.replace(/\./g, '')) || 0
  const dariHutang = Math.max(0, total - sendiri)

  const handleEdit = () => {
    if (!modalAwal) return
    setTotalModal(modalAwal.totalModal ? modalAwal.totalModal.toLocaleString('id-ID') : '')
    setDariSendiri(modalAwal.dariSendiri ? modalAwal.dariSendiri.toLocaleString('id-ID') : '')
    setTanggalMulai(modalAwal.tanggalMulai)
    setEditing(true)
    setConfirmEdit(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!tanggalMulai) {
      setError('Pilih tanggal mulai usaha')
      return
    }

    setSaving(true)
    try {
      const newData: ModalAwal = {
        totalModal: total,
        dariSendiri: sendiri,
        dariHutang,
        tanggalMulai,
        sudahDiisi: true,
      }
      await saveModalAwal(newData)
      setModalAwal(newData)
      setEditing(false)
      onSaved?.()
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setTotalModal(val ? parseInt(val).toLocaleString('id-ID') : '')
  }

  const handleSendiriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setDariSendiri(val ? parseInt(val).toLocaleString('id-ID') : '')
  }

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-[#64748B]">Memuat...</p>
      </Card>
    )
  }

  if (editing) {
    return (
      <Card>
        <h3 className="font-semibold text-[#0F172A] mb-3">Modal Awal Usaha</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Total modal awal"
            prefix="Rp"
            type="text"
            inputMode="numeric"
            value={totalModal}
            onChange={handleTotalChange}
            placeholder="0"
          />

          <Input
            label="Dari uang sendiri"
            prefix="Rp"
            type="text"
            inputMode="numeric"
            value={dariSendiri}
            onChange={handleSendiriChange}
            placeholder="0"
          />

          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1.5">Dari pinjaman (otomatis)</label>
            <div className="w-full rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2.5 text-base text-[#64748B] min-h-[44px] flex items-center">
              Rp {dariHutang.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Otomatis: total modal − uang sendiri</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1.5">Tanggal mulai usaha</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent min-h-[44px]"
            />
          </div>

          {error && <p className="text-sm text-[#DC2626]">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button type="submit" fullWidth disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  if (!modalAwal?.sudahDiisi) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-[#0F172A]">Modal Awal</p>
          <p className="text-xs text-[#64748B] mt-1 mb-3">Catat modal pertama kamu untuk menghitung sisa kas secara akurat</p>
          <Button size="sm" onClick={() => { setConfirmEdit(false); handleEdit() }}>
            Catat Modal Awal
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[#0F172A]">Modal Awal</h3>
        {!confirmEdit ? (
          <button onClick={() => setConfirmEdit(true)} className="text-xs text-[#2563EB] font-medium">
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmEdit(false)} className="text-xs text-[#64748B] font-medium">
              Batal
            </button>
            <button onClick={handleEdit} className="text-xs text-[#DC2626] font-medium">
              Ya, Edit
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[#64748B]">Total Modal</p>
          <p className="text-sm font-bold text-[#0F172A]">{formatRupiah(modalAwal.totalModal)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Dari Sendiri</p>
          <p className="text-sm font-bold text-[#166534]">{formatRupiah(modalAwal.dariSendiri)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Dari Pinjaman</p>
          <p className="text-sm font-bold text-[#DC2626]">{formatRupiah(modalAwal.dariHutang)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Mulai Usaha</p>
          <p className="text-sm font-bold text-[#0F172A]">{modalAwal.tanggalMulai}</p>
        </div>
      </div>
    </Card>
  )
}
