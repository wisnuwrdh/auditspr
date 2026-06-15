'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { exportToExcel, validateBackupFile, parseBackupFile } from '@/lib/utils/export'
import { getAllTransaksi, addTransaksi } from '@/lib/db/transaksi'
import { getAllKategori, addKategori } from '@/lib/db/kategori'
import { getAllHutang, getPembayaranByHutang } from '@/lib/db/hutang'
import { getTodayISO } from '@/lib/utils/format'
import type { PembayaranHutang } from '@/types'

export default function BackupRestore() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleExport = async () => {
    setExporting(true)
    setMessage('')
    try {
      const transaksi = await getAllTransaksi()
      const kategori = await getAllKategori()
      const hutang = await getAllHutang()
      const allPembayaran: PembayaranHutang[] = []
      for (const h of hutang) {
        const payments = await getPembayaranByHutang(h.id)
        allPembayaran.push(...payments)
      }

      const monthlyMap = new Map<string, { totalPemasukan: number; totalHPP: number; totalOps: number; labaKotor: number; labaBersih: number; totalPrive: number; totalBayarHutang: number; sisaKas: number; marginKotor: number; marginBersih: number }>()

      transaksi.forEach(t => {
        const bulan = t.tanggal.substring(0, 7)
        if (!monthlyMap.has(bulan)) {
          monthlyMap.set(bulan, {
            totalPemasukan: 0, totalHPP: 0, totalOps: 0,
            labaKotor: 0, labaBersih: 0, totalPrive: 0,
            totalBayarHutang: 0, sisaKas: 0, marginKotor: 0, marginBersih: 0,
          })
        }
      })

      const ringkasanBulanan = Array.from(monthlyMap.entries()).map(([bulan]) => {
        const transBulan = transaksi.filter(t => t.tanggal.startsWith(bulan))
        const totalPemasukan = transBulan.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + t.nominal, 0)
        const totalHPP = transBulan.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
        const totalPrive = transBulan.filter(t => t.jenis === 'prive').reduce((s, t) => s + t.nominal, 0)
        const totalBayarHutang = allPembayaran.filter(p => p.tanggal.startsWith(bulan)).reduce((s, p) => s + p.nominal, 0)
        const totalOps = 0
        const labaKotor = totalPemasukan - totalHPP
        const labaBersih = labaKotor - totalOps
        const sisaKas = labaBersih - totalPrive - totalBayarHutang
        const marginKotor = totalPemasukan > 0 ? (labaKotor / totalPemasukan) * 100 : 0
        const marginBersih = totalPemasukan > 0 ? (labaBersih / totalPemasukan) * 100 : 0

        return { bulan, totalPemasukan, totalHPP, totalOps, labaKotor, labaBersih, totalPrive, totalBayarHutang, sisaKas, marginKotor, marginBersih }
      })

      const data = await exportToExcel(transaksi, kategori, hutang, allPembayaran, ringkasanBulanan)
      const blob = new Blob([new Uint8Array(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cashflow-backup-${getTodayISO()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      localStorage.setItem('cashflow-last-backup', new Date().toISOString())
      setMessageType('success')
      setMessage('Backup berhasil diunduh!')
    } catch {
      setMessageType('error')
      setMessage('Gagal membuat file backup')
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx')) {
      setMessageType('error')
      setMessage('Hanya file .xlsx yang didukung')
      return
    }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const data = evt.target?.result as ArrayBuffer
      if (!data) {
        setMessageType('error')
        setMessage('Gagal membaca file')
        return
      }

      if (!validateBackupFile(data)) {
        setMessageType('error')
        setMessage('File ini bukan backup CashFlow UMKM')
        return
      }

      setFileData(data)
      setShowConfirm(true)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleRestore = async () => {
    if (!fileData) return

    setImporting(true)
    setShowConfirm(false)
    try {
      const restored = parseBackupFile(fileData)

      const db = await import('@/lib/db/index').then(m => m.getDB())
      const tx1 = db.transaction('transaksi', 'readwrite')
      await tx1.store.clear()
      await tx1.done

      for (const t of restored.transaksi) {
        await addTransaksi(t)
      }

      const tx2 = db.transaction('kategori', 'readwrite')
      await tx2.store.clear()
      await tx2.done

      for (const k of restored.kategori) {
        await addKategori(k)
      }

      const db3 = db.transaction('hutang', 'readwrite')
      await db3.store.clear()
      await db3.done

      for (const h of restored.hutang) {
        await db.add('hutang', h)
      }

      const db4 = db.transaction('pembayaran_hutang', 'readwrite')
      await db4.store.clear()
      await db4.done

      for (const p of restored.pembayaranHutang) {
        await db.add('pembayaran_hutang', p)
      }

      setMessageType('success')
      setMessage('Data berhasil dipulihkan!')
    } catch {
      setMessageType('error')
      setMessage('Gagal memulihkan data')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium text-[#0F172A] mb-3">Backup & Restore</p>

      <div className="space-y-3">
        <Button fullWidth onClick={handleExport} disabled={exporting}>
          {exporting ? 'Menyiapkan...' : 'Simpan Backup ke Excel'}
        </Button>

        <div>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileSelect}
            className="hidden"
            id="restore-file"
          />
          <label htmlFor="restore-file">
            <button
              type="button"
              disabled={importing}
              className="w-full rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] px-4 py-2.5 text-base font-medium min-h-[44px] hover:bg-[#DBEAFE] transition-colors"
              onClick={() => document.getElementById('restore-file')?.click()}
            >
              {importing ? 'Memulihkan...' : 'Pulihkan dari File Backup'}
            </button>
          </label>
        </div>

        {message && (
          <p className={`text-sm ${messageType === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {message}
          </p>
        )}
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Pulihkan Data"
      >
        <p className="text-sm text-[#64748B] mb-4">
          Data yang sekarang akan ditimpa. Lanjutkan?
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>
            Batal
          </Button>
          <Button variant="danger" fullWidth onClick={handleRestore} disabled={importing}>
            {importing ? 'Memulihkan...' : 'Ya, Pulihkan'}
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
