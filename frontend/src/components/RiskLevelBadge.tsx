interface Props {
  level: 'Low' | 'Medium' | 'High' | string
  size?: 'sm' | 'md' | 'lg'
}

const styles = {
  Low:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#059669', dot: '#10b981' },
  Medium: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#d97706', dot: '#f59e0b' },
  High:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   text: '#dc2626', dot: '#ef4444' },
}

const sizes = {
  sm: { cls: 'text-[11px] px-2 py-0.5 gap-1',      dot: 'w-1.5 h-1.5' },
  md: { cls: 'text-xs px-2.5 py-1 gap-1.5',         dot: 'w-1.5 h-1.5' },
  lg: { cls: 'text-sm px-3.5 py-1.5 gap-2 font-semibold', dot: 'w-2 h-2' },
}

export default function RiskLevelBadge({ level, size = 'md' }: Props) {
  const s = styles[level as keyof typeof styles] ?? { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', text: '#475569', dot: '#94a3b8' }
  const sz = sizes[size]
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold transition-all duration-250 ${sz.cls}`}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className={`rounded-full ${sz.dot}`} style={{ background: s.dot }} />
      {level}
    </span>
  )
}
