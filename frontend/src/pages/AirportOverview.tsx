import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import TopNavbar from '../components/TopNavbar'
import WeatherCard from '../components/WeatherCard'
import PredictionChart from '../components/PredictionChart'
import RiskLevelBadge from '../components/RiskLevelBadge'
import {
  getAirport, getRisk, getWeather, getPredictionHistory,
  type Airport, type Prediction, type WeatherSnapshot,
} from '../services/api'

export default function AirportOverview() {
  const { id } = useParams<{ id: string }>()
  const airportId = Number(id)

  const [airport,    setAirport]    = useState<Airport | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [weather,    setWeather]    = useState<WeatherSnapshot | null>(null)
  const [history,    setHistory]    = useState<Prediction[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    if (!airportId) return
    setLoading(true)
    Promise.all([
      getAirport(airportId),
      getRisk(airportId),
      getWeather(airportId, 1),
      getPredictionHistory(airportId, 24),
    ])
      .then(([a, p, w, h]) => { setAirport(a); setPrediction(p); setWeather(w[0] ?? null); setHistory(h) })
      .catch(() => setError('Failed to load airport data.'))
      .finally(() => setLoading(false))
  }, [airportId])

  if (error) return <div className="flex-1 p-6 text-red-500 text-sm">{error}</div>

  const title = airport ? `${airport.airport_code} — ${airport.airport_name}` : 'Loading…'
  const subtitle = airport
    ? `${airport.habitat_profile.replace('_', ' ')} · ${airport.latitude.toFixed(4)}°N, ${airport.longitude.toFixed(4)}°E`
    : undefined

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title={title} subtitle={subtitle} />
      <main className="flex-1 p-6 space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Risk hero */}
        {loading ? (
          <div className="skeleton rounded-2xl h-32" />
        ) : prediction ? (
          <div className="glass rounded-2xl p-6 animate-slide-up">
            <div className="flex flex-wrap items-start gap-8">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium mb-2">3-Hour Strike Probability</p>
                <p className="text-5xl font-bold text-slate-800">{(prediction.predicted_probability * 100).toFixed(1)}<span className="text-2xl text-slate-400">%</span></p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium mb-2">Risk Level</p>
                <RiskLevelBadge level={prediction.risk_level} size="lg" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium mb-2">Window</p>
                <p className="text-sm text-slate-600 font-mono">
                  {new Date(prediction.window_start).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  {' → '}
                  {new Date(prediction.window_end).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                </p>
              </div>
              {prediction.top_factors.length > 0 && (
                <div className="ml-auto">
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium mb-2">Top Factor</p>
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600"
                    style={{ background: 'rgba(59,110,246,0.08)', border: '1px solid rgba(59,110,246,0.18)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {prediction.top_factors[0].feature}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="skeleton rounded-2xl h-28" />
        ) : weather ? (
          <WeatherCard
            temperature={weather.temperature}
            visibility={weather.visibility}
            windSpeed={weather.wind_speed}
            precipitation={weather.precipitation}
            cloudCover={weather.cloud_cover}
            observedAt={weather.observation_time}
          />
        ) : null}

        {loading ? (
          <div className="skeleton rounded-2xl h-64" />
        ) : history.length > 0 ? (
          <PredictionChart predictions={history} />
        ) : null}
      </main>
    </div>
  )
}
