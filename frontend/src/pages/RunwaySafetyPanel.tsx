import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import RiskLevelBadge from '../components/RiskLevelBadge'
import { getAirports, getRisk, type Airport, type Prediction } from '../services/api'

interface Row { airport: Airport; prediction: Prediction }

const actionStyle = {
  High:   'text-red-600',
  Medium: 'text-amber-600',
  Low:    'text-emerald-600',
}

const rowBg = {
  High:   { bg: 'rgba(239,68,68,0.05)',  border: 'rgba(239,68,68,0.15)'  },
  Medium: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.15)' },
  Low:    { bg: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.5)' },
}

export default function RunwaySafetyPanel() {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAirports().then(async airports => {
      const settled = await Promise.allSettled(airports.map(a => getRisk(a.airport_id)))
      const result: Row[] = []
      settled.forEach((r, i) => { if (r.status === 'fulfilled') result.push({ airport: airports[i], prediction: r.value }) })
      result.sort((a, b) => b.prediction.predicted_probability - a.prediction.predicted_probability)
      setRows(result)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="Runway Safety Panel" subtitle="Dispatch recommendations for the current 3-hour window" />
      <main className="flex-1 p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(({ airport, prediction }) => {
              const level = prediction.risk_level as 'High' | 'Medium' | 'Low'
              const rs = rowBg[level]
              return (
                <div
                  key={airport.airport_id}
                  className="rounded-2xl p-5 flex items-center gap-5 transition-all duration-250 interactive"
                  style={{ background: rs.bg, border: `1px solid ${rs.border}`, backdropFilter: 'blur(12px)' }}
                >
                  {/* Airport */}
                  <div className="w-24 shrink-0">
                    <p className="font-bold text-slate-800 text-sm">{airport.airport_code}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{airport.habitat_profile.replace('_', ' ')}</p>
                  </div>

                  {/* Risk */}
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <RiskLevelBadge level={level} />
                    <span className="text-sm font-semibold text-slate-700">
                      {(prediction.predicted_probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Action */}
                  <p className={`flex-1 text-sm font-medium ${actionStyle[level]}`}>
                    {level === 'High'
                      ? 'Immediate runway wildlife response required. Operational caution advised. Contact ATC.'
                      : level === 'Medium'
                      ? 'Increase patrol frequency. Alert safety team and log observation.'
                      : 'Continue standard monitoring. No immediate action required.'}
                  </p>

                  {/* Window */}
                  <div className="text-right text-[11px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                    {new Date(prediction.window_start).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    {' – '}
                    {new Date(prediction.window_end).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
