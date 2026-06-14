'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackupReminder() {
  const router = useRouter()
  const [hari, setHari] = useState<number | null>(null)

  useEffect(() => {
    const lastBackup = localStorage.getItem('cashflow-last-backup')
    if (!lastBackup) {
      setHari(-1)
      return
    }
    const last = new Date(lastBackup)
    const now = new Date()
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    setHari(diff)
  }, [])

  if (hari === null) return null

  if (hari === -1) {
    return (
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 flex items-center gap-3">
        <AlertTriangle size={18} className="text-[#D97706] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#92400E]">Backup belum pernah dilakukan</p>
          <p className="text-xs text-[#A16207]">Data penting, backup secara rutin di Pengaturan</p>
        </div>
        <button
          onClick={() => router.push('/pengaturan')}
          className="text-xs font-semibold text-[#D97706] hover:text-[#B45309] whitespace-nowrap"
        >
          Backup
        </button>
      </div>
    )
  }

  if (hari >= 7) {
    return (
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 flex items-center gap-3">
        <AlertTriangle size={18} className="text-[#DC2626] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#991B1B]">Terakhir backup {hari} hari lalu</p>
          <p className="text-xs text-[#B91C1C]">Segera backup data bisnis kamu</p>
        </div>
        <button
          onClick={() => router.push('/pengaturan')}
          className="text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] whitespace-nowrap"
        >
          Backup
        </button>
      </div>
    )
  }

  return null
}
