'use client'

import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { addKategori, updateKategori, deleteKategori } from '@/lib/db/kategori'
import { LABEL_JENIS_KATEGORI } from '@/lib/constants'
import type { Kategori, JenisKategori } from '@/types'

interface KategoriManagerProps {
  kategori: Kategori[]
  onRefresh: () => void
}

export default function KategoriManager({ kategori, onRefresh }: KategoriManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null)
  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState<JenisKategori>('pemasukan')
  const [error, setError] = useState('')

  const openAdd = () => {
    setEditingKategori(null)
    setNama('')
    setJenis('pemasukan')
    setError('')
    setShowModal(true)
  }

  const openEdit = (k: Kategori) => {
    setEditingKategori(k)
    setNama(k.nama)
    setJenis(k.jenis)
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!nama.trim()) {
      setError('Nama kategori harus diisi')
      return
    }

    try {
      if (editingKategori) {
        await updateKategori({ ...editingKategori, nama: nama.trim(), jenis })
      } else {
        await addKategori({
          id: uuid(),
          nama: nama.trim(),
          jenis,
          isDefault: false,
          createdAt: new Date().toISOString(),
        })
      }
      setShowModal(false)
      onRefresh()
    } catch {
      setError('Gagal menyimpan')
    }
  }

  const handleDelete = async (k: Kategori) => {
    if (k.isDefault) return
    await deleteKategori(k.id)
    onRefresh()
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#0F172A]">Kategori</p>
        <Button size="sm" onClick={openAdd}>
          <Plus size={16} className="mr-1" />
          Tambah
        </Button>
      </div>

      <div className="space-y-2">
        {kategori.map(k => (
          <div
            key={k.id}
            className="flex items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0"
          >
            <div>
              <p className="text-sm text-[#0F172A]">{k.nama}</p>
              <p className="text-xs text-[#64748B]">{LABEL_JENIS_KATEGORI[k.jenis]}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(k)}
                className="p-1.5 text-[#94A3B8] hover:text-[#2563EB]"
              >
                <Pencil size={14} />
              </button>
              {!k.isDefault && (
                <button
                  onClick={() => handleDelete(k)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <div className="space-y-4">
          <Input
            label="Nama Kategori"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama kategori"
          />
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1.5">
              Jenis
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as JenisKategori)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
            >
              {Object.entries(LABEL_JENIS_KATEGORI).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-[#DC2626]">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button fullWidth onClick={handleSave}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
