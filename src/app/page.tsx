'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2563EB] mb-2">CashFlow UMKM</h1>
        <p className="text-[#64748B] text-sm mb-4">Memuat...</p>
        <Loader2 size={24} className="animate-spin text-[#2563EB] mx-auto" />
      </div>
    </div>
  )
}
