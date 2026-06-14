'use client'

import { useEffect, ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-[#CBD5E1] rounded-full" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            {title && <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors ml-auto text-[#64748B] text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
