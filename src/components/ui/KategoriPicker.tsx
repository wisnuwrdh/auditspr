'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Kategori, JenisKategori } from '@/types'

interface KategoriPickerProps {
  kategori: Kategori[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}

const JENIS_GROUP: Record<JenisKategori, string> = {
  pemasukan: 'Pemasukan',
  hpp: 'Bahan Baku',
  stok_pendukung: 'Perlengkapan',
  ops_tetap: 'Tagihan Rutin',
  ops_variabel: 'Lainnya',
}

export default function KategoriPicker({ kategori, selectedId, onSelect, onClose }: KategoriPickerProps) {
  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const filtered = search.trim()
      ? kategori.filter(k => k.nama.toLowerCase().includes(search.toLowerCase()))
      : kategori

    const groups = new Map<JenisKategori, Kategori[]>()
    const order: JenisKategori[] = ['pemasukan', 'hpp', 'stok_pendukung', 'ops_tetap', 'ops_variabel']

    order.forEach(jenis => {
      const items = filtered.filter(k => k.jenis === jenis)
      if (items.length > 0) groups.set(jenis, items)
    })

    return { groups, order: order.filter(j => groups.has(j)) }
  }, [kategori, search])

  const dotColor = (jenis: JenisKategori) => {
    switch (jenis) {
      case 'pemasukan': return 'bg-[#16A34A]'
      case 'hpp': return 'bg-[#DC2626]'
      case 'stok_pendukung': return 'bg-[#D97706]'
      case 'ops_tetap': return 'bg-[#2563EB]'
      case 'ops_variabel': return 'bg-[#8B5CF6]'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-xl w-full max-w-md max-h-[75vh] flex flex-col z-10 animate-slide-up">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#E2E8F0]">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-[#CBD5E1] rounded-full sm:hidden" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <h3 className="text-base font-semibold text-[#0F172A]">Pilih kategori</h3>
            <button onClick={onClose} className="p-1 text-[#64748B] hover:text-[#0F172A]">
              <X size={20} />
            </button>
          </div>

          {kategori.length > 8 && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] pl-9 pr-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto p-4 pt-2 flex-1">
          {grouped.order.map(jenis => (
            <div key={jenis} className="mb-4 last:mb-0">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 px-0.5">
                {JENIS_GROUP[jenis]}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {grouped.groups.get(jenis)!.map(k => {
                  const isSelected = k.id === selectedId
                  return (
                    <button
                      key={k.id}
                      onClick={() => {
                        onSelect(k.id)
                        onClose()
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all min-h-[48px] ${
                        isSelected
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE]'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor(k.jenis)}`} />
                      <span className="text-sm font-medium text-[#0F172A] leading-tight">{k.nama}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {grouped.order.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[#94A3B8]">Kategori tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
