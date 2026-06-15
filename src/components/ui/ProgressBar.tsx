'use client'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
  bgColor?: string
  height?: number
}

export default function ProgressBar({
  value,
  max,
  label,
  color = '#2563EB',
  bgColor = '#E2E8F0',
  height = 8,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-[#64748B] mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: bgColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
