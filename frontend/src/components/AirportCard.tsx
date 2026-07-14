import { Link } from 'react-router-dom'
import type { Airport } from '../services/api'
import RiskLevelBadge from './RiskLevelBadge'

interface Props {
  airport:     Airport
  probability: number | null
  riskLevel:   string | null
  loading?:    boolean
}

const profileStyle: Record<string, { bg: string; border: string; color: string }> = {
  coastal:         { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.15)',  color: '#0ea5e9' },
  coastal_wetland: { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.15)',  color: '#0ea5e9' },
  wetland:         { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  floodplain:      { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  riverine:        { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.15)',  color: '#6366f1' },
  inland_scrub:    { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
}

const defaultStyle = { bg: 'rgba(59,110,246,0.07)', border: 'rgba(59,110,246,0.12)', color: '#3b6ef6' }

const barGradient = (level: string | null) =>
  level === 'High'   ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
  level === 'Medium' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                       'linear-gradient(90deg, #10b981, #059669)'

export default function AirportCard({ airport, probability, riskLevel, loading }: Props) {
  const ps = profileStyle[airport.habitat_profile] ?? defaultStyle

  return (
    <Link
      to={`/airports/${airport.airport_id}`}
      className="block glass rounded-2xl p-5 transition-all duration-350 hover:shadow-glass-lg hover:-translate-y-1 hover:scale-[1.01] group animate-scale-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-250 group-hover:scale-110"
            style={{ background: ps.bg, border: `1px solid ${ps.border}` }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={ps.color} strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm tracking-tight">{airport.airport_code}</p>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 max-w-[130px] truncate">{airport.airport_name}</p>
          </div>
        </div>
        {loading ? (
          <div className="skeleton w-16 h-5 rounded-full" />
        ) : riskLevel ? (
          <RiskLevelBadge level={riskLevel} size="sm" />
        ) : null}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="skeleton h-1.5 w-full rounded-full" />
        ) : probability !== null ? (
          <>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-400 font-medium">Strike probability</span>
              <span className="font-bold text-slate-700">{(probability * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(59,110,246,0.08)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(probability * 100, 100)}%`,
                  background: barGradient(riskLevel),
                  boxShadow: riskLevel === 'High' ? '0 0 8px rgba(239,68,68,0.4)' :
                             riskLevel === 'Medium' ? '0 0 8px rgba(245,158,11,0.4)' :
                             '0 0 8px rgba(16,185,129,0.4)',
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-[11px] text-slate-400 font-medium">No prediction yet</p>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-medium capitalize">{airport.habitat_profile.replace(/_/g, ' ')}</p>
        {airport.elevation && <p className="text-[11px] text-slate-400 font-medium">{airport.elevation} m</p>}
      </div>
    </Link>
  )
}
