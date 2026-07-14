import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import AirportCard from '../components/AirportCard'
import MapPanel from '../components/MapPanel'
import { getAirports, getRisk, type Airport, type Prediction } from '../services/api'

interface RiskMap { [airportId: number]: Prediction }

const StatCard = ({ label, count, level }: { label: string; count: number; level: 'High' | 'Medium' | 'Low' }) => {
  const styles = {
    High:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)',   text: '#dc2626', dot: '#ef4444'  },
    Medium: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)',  text: '#d97706', dot: '#f59e0b'  },
    Low:    { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)',  text: '#059669', dot: '#10b981'  },
  }
  const s = styles[level]
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up interactive" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label} Risk</p>
        <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
      </div>
      <p className="text-3xl font-bold" style={{ color: s.text }}>{count}</p>
      <p className="text-[11px] text-slate-400 mt-1">airports</p>
    </div>
  )
}

export default function Dashboard() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [risks,    setRisks]    = useState<RiskMap>({})
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    getAirports()
      .then(async list => {
        setAirports(list)
        const entries = await Promise.allSettled(list.map(a => getRisk(a.airport_id)))
        const map: RiskMap = {}
        entries.forEach((r, i) => { if (r.status === 'fulfilled') map[list[i].airport_id] = r.value })
        setRisks(map)
      })
      .catch(() => setError('Could not reach the AvianShield API. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const mapData = airports.map(a => ({
    airport:   a,
    riskLevel: risks[a.airport_id]?.risk_level ?? null,
    prob:      risks[a.airport_id]?.predicted_probability ?? null,
  }))

  const counts: Record<'High' | 'Medium' | 'Low', number> = { High: 0, Medium: 0, Low: 0 }
  Object.values(risks).forEach(r => { counts[r.risk_level as 'High' | 'Medium' | 'Low'] = (counts[r.risk_level as 'High' | 'Medium' | 'Low'] ?? 0) + 1 })

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="Dashboard" subtitle="Live bird-strike risk across all monitored airports" />
      <main className="flex-1 p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="High"   count={counts.High}   level="High"   />
          <StatCard label="Medium" count={counts.Medium} level="Medium" />
          <StatCard label="Low"    count={counts.Low}    level="Low"    />
        </div>

        {/* Map */}
        <MapPanel airports={mapData} />

        {/* Section header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-semibold text-slate-700">All Airports</h2>
          <span className="text-[11px] text-slate-400">{airports.length} monitored</span>
        </div>

        {/* Airport cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-36" />
              ))
            : airports.map(a => (
                <AirportCard
                  key={a.airport_id}
                  airport={a}
                  probability={risks[a.airport_id]?.predicted_probability ?? null}
                  riskLevel={risks[a.airport_id]?.risk_level ?? null}
                />
              ))
          }
        </div>
      </main>
    </div>
  )
}
