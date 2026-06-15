'use client'

import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, UserMinus, Trash2, Pencil } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { formatRupiah } from '@/lib/utils/format'
import { updateTransaksi, addTransaksi, deleteTransaksi } from '@/lib/db/transaksi'
import { getAllKategori } from '@/lib/db/kategori'
import type { Transaksi, Kategori } from '@/types'

interface RiwayatTransaksiProps {
  transaksi: Transaksi[]
  onDelete: (id: string) => void
  onEdit: () => void
}

export default function RiwayatTransaksi({ transaksi, onDelete, onEdit }: RiwayatTransaksiProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Transaksi | null>(null)
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [editNominal, setEditNominal] = useState('')
  const [editKategoriId, setEditKategoriId] = useState('')
  const [editCatatan, setEditCatatan] = useState('')
  const [editTanggal, setEditTanggal] = useState('')
  const [editIsSusut, setEditIsSusut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const getIcon = (jenis: string) => {
    switch (jenis) {
      case 'pemasukan':
        return <ArrowDownCircle size={18} className="text-[#16A34A]" />
      case 'pengeluaran':
        return <ArrowUpCircle size={18} className="text-[#DC2626]" />
      case 'prive':
        return <UserMinus size={18} className="text-[#D97706]" />
      default:
        return null
    }
  }

  const getLabel = (jenis: string) => {
    switch (jenis) {
      case 'pemasukan': return 'Pemasukan'
      case 'pengeluaran': return 'Pengeluaran'
      case 'prive': return 'Ambil Keluarga'
      default: return ''
    }
  }

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const openEdit = async (t: Transaksi) => {
    try {
      const kats = await getAllKategori()
      setKategori(kats)
    } catch {}
    setEditItem(t)
    setEditNominal(t.nominal.toLocaleString('id-ID'))
    setEditKategoriId(t.kategoriId)
    setEditCatatan(t.catatan || '')
    setEditTanggal(t.tanggal)
    setEditIsSusut(t.isSusut || false)
    setError('')
  }

  const handleEditNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setEditNominal(val ? parseInt(val).toLocaleString('id-ID') : '')
  }

  const handleEditSave = async () => {
    if (!editItem) return
    setError('')

    const nominalNum = parseInt(editNominal.replace(/\./g, ''))
    if (!nominalNum || nominalNum <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }
    if (!editTanggal) {
      setError('Pilih tanggal')
      return
    }

    setSaving(true)
    try {
      const isPrive = editItem.jenis === 'prive'
      if (editItem.jenis === 'prive' && editItem.kategoriId !== 'prive') {
        await deleteTransaksi(editItem.id)
        const newTrans: Transaksi = {
          id: uuid(),
          tanggal: editTanggal,
          jenis: 'prive',
          kategoriId: 'prive',
          nominal: nominalNum,
          catatan: editCatatan || undefined,
          createdAt: editItem.createdAt,
          updatedAt: new Date().toISOString(),
        }
        await addTransaksi(newTrans)
      } else if (isPrive) {
        await updateTransaksi(editItem.id, {
          tanggal: editTanggal,
          nominal: nominalNum,
          catatan: editCatatan || undefined,
          updatedAt: new Date().toISOString(),
        })
      } else {
        await updateTransaksi(editItem.id, {
          tanggal: editTanggal,
          kategoriId: editKategoriId,
          nominal: nominalNum,
          catatan: editCatatan || undefined,
          isSusut: editItem.jenis === 'pengeluaran' ? editIsSusut : undefined,
          updatedAt: new Date().toISOString(),
        })
      }
      setEditItem(null)
      onEdit()
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (transaksi.length === 0) {
    return (
      <Card>
        <div className="text-center py-6">
          <p className="text-sm font-medium text-[#64748B]">Belum ada catatan</p>
          <p className="text-xs text-[#94A3B8] mt-1">Mulai catat pemasukan atau pengeluaran di atas</p>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <p className="text-sm font-medium text-[#64748B] mb-2">
        Riwayat ({transaksi.length})
      </p>
      <div className="space-y-2">
        {transaksi.map(t => (
          <Card key={t.id} padding="sm">
            <div className="flex items-center gap-3">
              {getIcon(t.jenis)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A]">
                  {getLabel(t.jenis)}
                </p>
                {t.catatan && (
                  <p className="text-xs text-[#64748B] truncate">{t.catatan}</p>
                )}
              </div>
              <div className="text-right flex items-center gap-1">
                <div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatRupiah(t.nominal)}
                  </p>
                  {t.isSusut && (
                    <span className="text-[10px] text-[#D97706]">Susut</span>
                  )}
                </div>
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(t.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Transaksi"
      >
        <p className="text-sm text-[#64748B] mb-1">
          Apakah kamu yakin ingin menghapus transaksi ini?
        </p>
        <p className="text-xs text-[#DC2626] mb-4">Data yang dihapus tidak bisa dikembalikan.</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" fullWidth onClick={confirmDelete}>Ya, Hapus</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Transaksi"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1.5">Tanggal</label>
            <input
              type="date"
              value={editTanggal}
              onChange={(e) => setEditTanggal(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
            />
          </div>

          <Input
            label="Nominal"
            prefix="Rp"
            type="text"
            inputMode="numeric"
            value={editNominal}
            onChange={handleEditNominalChange}
            placeholder="0"
          />

          {editItem && editItem.jenis !== 'prive' && (
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-1.5">Kategori</label>
              <select
                value={editKategoriId}
                onChange={(e) => setEditKategoriId(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
              >
                {kategori.filter(k => {
                  if (editItem.jenis === 'pemasukan') return k.jenis === 'pemasukan'
                  return k.jenis !== 'pemasukan'
                }).map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          )}

          {editItem && editItem.jenis === 'pengeluaran' && (
            <label className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                checked={editIsSusut}
                onChange={(e) => setEditIsSusut(e.target.checked)}
                className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB]"
              />
              <span className="text-sm text-[#0F172A]">Bahan tidak habis terjual (susut)</span>
            </label>
          )}

          <Input
            label="Catatan"
            type="text"
            value={editCatatan}
            onChange={(e) => setEditCatatan(e.target.value)}
            placeholder="Catatan (opsional)"
          />

          {error && <p className="text-sm text-[#DC2626]">{error}</p>}

          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setEditItem(null)}>Batal</Button>
            <Button fullWidth onClick={handleEditSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
