'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth = false, size = 'md', className = '', children, ...props }, ref) => {
    const base = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]'
    const width = fullWidth ? 'w-full' : ''
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }
    const variants = {
      primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]',
      secondary: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] hover:bg-[#DBEAFE]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
      ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9]',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${width} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
