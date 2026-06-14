'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, PlusCircle, BarChart3, Settings } from 'lucide-react'

const tabs = [
  { label: 'Beranda', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Catat', icon: PlusCircle, href: '/catat' },
  { label: 'Laporan', icon: BarChart3, href: '/laporan' },
  { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const Icon = tab.icon
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
