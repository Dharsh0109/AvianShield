import type { DispatchAlert } from '../services/api'
import RiskLevelBadge from './RiskLevelBadge'

interface Props {
  alerts:          DispatchAlert[]
  onStatusChange?: (alertId: number, status: string) => void
}

export default function DispatchAlertTable({ alerts, onStatusChange }: Props) {
  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(59,110,246,0.06)', border: '1px solid rgba(59,110,246,0.12)' }}>
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">No alerts found</p>
        <p className="text-xs text-slate-400 mt-1">All clear for the selected filter</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(59,110,246,0.1)' }}>
            {['Time', 'Level', 'Message', 'Recommended Action', 'Status'].map(h => (
              <th key={h} className="pb-3 pr-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, idx) => (
            <tr
              key={a.alert_id}
              className="transition-all duration-200 hover:bg-white/40 rounded-xl"
              style={{ borderBottom: idx < alerts.length - 1 ? '1px solid rgba(59,110,246,0.06)' : 'none' }}
            >
              <td className="py-3.5 pr-4 text-[11px] text-slate-400 font-medium whitespace-nowrap font-mono">
                {new Date(a.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </td>
              <td className="py-3.5 pr-4">
                <RiskLevelBadge level={a.alert_level} size="sm" />
              </td>
              <td className="py-3.5 pr-4 text-slate-700 max-w-xs text-xs font-medium">{a.alert_message}</td>
              <td className="py-3.5 pr-4 text-slate-500 max-w-sm text-[11px]">{a.recommended_action}</td>
              <td className="py-3.5">
                {onStatusChange && a.status === 'active' ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onStatusChange(a.alert_id, 'acknowledged')}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => onStatusChange(a.alert_id, 'resolved')}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}
                    >
                      Resolve
                    </button>
                  </div>
                ) : (
                  <span
                    className="text-[11px] capitalize font-semibold px-2.5 py-1.5 rounded-lg"
                    style={
                      a.status === 'resolved'     ? { background: 'rgba(16,185,129,0.1)',  color: '#059669', border: '1px solid rgba(16,185,129,0.2)'  } :
                      a.status === 'acknowledged' ? { background: 'rgba(245,158,11,0.1)',  color: '#d97706', border: '1px solid rgba(245,158,11,0.2)'  } :
                                                    { background: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)'   }
                    }
                  >
                    {a.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
