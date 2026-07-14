import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import DispatchAlertTable from '../components/DispatchAlertTable'
import { getAlerts, patchAlertStatus, type DispatchAlert } from '../services/api'

const filterTabs = ['all', 'active', 'acknowledged', 'resolved'] as const

export default function AlertManagement() {
  const [alerts,  setAlerts]  = useState<DispatchAlert[]>([])
  const [filter,  setFilter]  = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAlerts(200).then(setAlerts).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleStatus = async (alertId: number, status: string) => {
    await patchAlertStatus(alertId, status)
    load()
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter)
  const counts = alerts.reduce((acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="Alert Management" subtitle="Review and action all dispatch alerts" />
      <main className="flex-1 p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'active',       label: 'Active',       color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)'   },
            { key: 'acknowledged', label: 'Acknowledged', color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)'  },
            { key: 'resolved',     label: 'Resolved',     color: '#059669', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)'  },
          ].map(({ key, label, color, bg, border }) => (
            <div key={key} className="glass rounded-2xl p-4 animate-slide-up" style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color }}>{counts[key] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {filterTabs.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-250 interactive"
              style={filter === s ? {
                background: 'rgba(59,110,246,0.1)',
                color: '#2554e8',
                border: '1px solid rgba(59,110,246,0.25)',
              } : {
                background: 'rgba(255,255,255,0.6)',
                color: '#64748b',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {s}
              {s !== 'all' && counts[s] ? (
                <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] text-slate-400"
                  style={{ background: 'rgba(59,110,246,0.06)' }}>{counts[s]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass rounded-2xl p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : (
            <DispatchAlertTable alerts={filtered} onStatusChange={handleStatus} />
          )}
        </div>
      </main>
    </div>
  )
}
