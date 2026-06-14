'use client'

import { useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'

const hiddenNavPages = ['/']

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showNav = !hiddenNavPages.includes(pathname)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <>
      {pathname === '/' ? (
        children
      ) : (
        <div className="max-w-lg mx-auto min-h-screen bg-white pb-20">
          <main className="px-4 pt-5">{children}</main>
          {showNav && <BottomNav />}
        </div>
      )}
    </>
  )
}
