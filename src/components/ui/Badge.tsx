import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
  children: ReactNode
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  const variants = {
    success: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    danger: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
    warning: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20',
    info: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20',
    default: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  )
}
