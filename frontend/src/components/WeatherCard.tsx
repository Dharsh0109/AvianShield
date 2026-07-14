interface Props {
  temperature:   number | null
  visibility:    number | null
  windSpeed:     number | null
  precipitation: number | null
  cloudCover:    number | null
  observedAt?:   string
}

const fmt = (v: number | null, d = 1) => (v !== null && v !== undefined ? v.toFixed(d) : '—')

const tiles = (p: Props) => [
  { label: 'Temperature',   value: fmt(p.temperature),      unit: '°C',   icon: '🌡️', color: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)'   },
  { label: 'Visibility',    value: fmt(p.visibility, 0),    unit: 'm',    icon: '👁️', color: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.15)'  },
  { label: 'Wind Speed',    value: fmt(p.windSpeed),        unit: 'km/h', icon: '💨', color: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.15)'  },
  { label: 'Precipitation', value: fmt(p.precipitation),    unit: 'mm',   icon: '🌧️', color: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.15)'  },
  { label: 'Cloud Cover',   value: fmt(p.cloudCover, 0),    unit: '%',    icon: '☁️', color: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)'  },
]

export default function WeatherCard(props: Props) {
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
            🌤️
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Current Weather</h3>
            {props.observedAt && (
              <p className="text-[10px] text-slate-400 font-medium">
                Observed {new Date(props.observedAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })} IST
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {tiles(props).map(({ label, value, unit, icon, color, border }) => (
          <div
            key={label}
            className="rounded-xl p-3 transition-all duration-250 hover:scale-[1.02] cursor-default"
            style={{ background: color, border: `1px solid ${border}`, backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm leading-none">{icon}</span>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-xl font-bold text-slate-800 leading-none">
              {value}
              <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
