interface Props {
  title: string
  subtitle?: string
}

export default function TopNavbar({ title, subtitle }: Props) {
  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <header className="glass-nav px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="animate-fade-in">
        <h1 className="text-[15px] font-semibold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-medium hidden sm:block">{now} IST</span>
        <div className="h-4 w-px bg-slate-200" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-emerald-700 border border-emerald-200/80"
          style={{ background: 'rgba(16,185,129,0.08)', backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </header>
  )
}
