import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import PredictionChart from '../components/PredictionChart'
import RiskLevelBadge from '../components/RiskLevelBadge'
import { getAirports, getPredictionHistory, type Airport, type Prediction } from '../services/api'

export default function PredictionHistory() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [history,  setHistory]  = useState<Prediction[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    getAirports().then(list => {
      setAirports(list)
      if (list.length) setSelected(list[0].airport_id)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getPredictionHistory(selected, 48).then(setHistory).finally(() => setLoading(false))
  }, [selected])

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="Prediction History" subtitle="48-window strike probability trend per airport" />
      <main className="flex-1 p-6 space-y-5">
        {/* Airport selector */}
        <div className="flex gap-2 flex-wrap">
          {airports.map(a => (
            <button
              key={a.airport_id}
              onClick={() => setSelected(a.airport_id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-250 interactive"
              style={selected === a.airport_id ? {
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
              {a.airport_code}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton rounded-2xl h-56" />
        ) : history.length > 0 ? (
          <>
            <PredictionChart predictions={history} />

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(59,110,246,0.08)' }}>
                <h3 className="text-sm font-semibold text-slate-700">Window Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(59,110,246,0.08)' }}>
                      {['Window Start', 'Window End', 'Probability', 'Risk Level'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((p, i) => (
                      <tr key={i} className="transition-colors hover:bg-white/40"
                        style={{ borderBottom: i < history.length - 1 ? '1px solid rgba(59,110,246,0.06)' : 'none' }}>
                        <td className="px-5 py-3 text-[11px] text-slate-400 font-mono">
                          {new Date(p.window_start).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-5 py-3 text-[11px] text-slate-400 font-mono">
                          {new Date(p.window_end).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                          {(p.predicted_probability * 100).toFixed(2)}%
                        </td>
                        <td className="px-5 py-3">
                          <RiskLevelBadge level={p.risk_level} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(59,110,246,0.06)', border: '1px solid rgba(59,110,246,0.12)' }}>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No prediction history yet for this airport</p>
          </div>
        )}
      </main>
    </div>
  )
}
