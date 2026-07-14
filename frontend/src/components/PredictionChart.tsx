import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { Prediction } from '../services/api'

interface Props { predictions: Prediction[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value as number
  const color = val > 60 ? '#ef4444' : val > 30 ? '#f59e0b' : '#10b981'
  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 text-xs shadow-glass-lg">
      <p className="text-slate-400 font-medium mb-1">{label}</p>
      <p className="font-bold text-base" style={{ color }}>{val.toFixed(1)}%</p>
      <p className="text-slate-400 text-[10px]">strike probability</p>
    </div>
  )
}

export default function PredictionChart({ predictions }: Props) {
  const data = [...predictions].reverse().map(p => ({
    time: new Date(p.window_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    prob: parseFloat((p.predicted_probability * 100).toFixed(2)),
  }))

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,110,246,0.1)', border: '1px solid rgba(59,110,246,0.2)' }}>
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Strike Probability Trend</h3>
            <p className="text-[10px] text-slate-400 font-medium">{predictions.length} prediction windows</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-0.5 rounded bg-emerald-400 inline-block" />Low</span>
          <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-0.5 rounded bg-amber-400 inline-block" />Med</span>
          <span className="flex items-center gap-1 text-red-500"><span className="w-2 h-0.5 rounded bg-red-400 inline-block" />High</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b6ef6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b6ef6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,110,246,0.08)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,110,246,0.15)', strokeWidth: 1 }} />
          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 2" strokeOpacity={0.5} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} />
          <Area type="monotone" dataKey="prob" stroke="#3b6ef6" strokeWidth={2.5} fill="url(#probGrad)" dot={false} activeDot={{ r: 5, fill: '#3b6ef6', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
