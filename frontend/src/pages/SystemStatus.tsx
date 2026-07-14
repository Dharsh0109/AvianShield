import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import { getMetrics, type ModelMetrics } from '../services/api'
import api from '../services/api'

const MetricCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="glass rounded-2xl p-5 text-center animate-scale-in">
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wide font-medium">{label}</p>
    {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
  </div>
)

export default function SystemStatus() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null)
  const [health,  setHealth]  = useState<'ok' | 'error' | 'loading'>('loading')
  const [mError,  setMError]  = useState<string | null>(null)

  useEffect(() => {
    api.get('/health').then(() => setHealth('ok')).catch(() => setHealth('error'))
    getMetrics().then(setMetrics).catch(() => setMError('Could not load model metrics. Run evaluate.py first.'))
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="System Status" subtitle="API health and ML model performance metrics" />
      <main className="flex-1 p-6 space-y-5 max-w-3xl">

        {/* API Health */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">API Health</p>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              health === 'ok' ? 'bg-emerald-400' : health === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
            }`} />
            <span className={`text-sm font-medium ${
              health === 'ok' ? 'text-emerald-600' : health === 'error' ? 'text-red-500' : 'text-amber-500'
            }`}>
              {health === 'ok' ? 'AvianShield API is reachable' :
               health === 'error' ? 'API unreachable — is the backend running?' : 'Checking…'}
            </span>
            {health === 'ok' && (
              <span className="ml-auto text-[11px] text-slate-400 font-mono">http://localhost:8000</span>
            )}
          </div>
        </div>

        {/* Model Metrics */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Model Performance — Test Set 2023</p>
          {mError ? (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {mError}
            </div>
          ) : metrics ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <MetricCard label="Recall"    value={(metrics.recall    * 100).toFixed(1) + '%'} />
                <MetricCard label="Precision" value={(metrics.precision * 100).toFixed(1) + '%'} />
                <MetricCard label="F1-Score"  value={(metrics.f1_score  * 100).toFixed(1) + '%'} />
                <MetricCard label="PR-AUC"    value={metrics.pr_auc.toFixed(4)} />
              </div>
              <div className="pt-4 space-y-1.5 text-[11px] text-slate-400" style={{ borderTop: '1px solid rgba(59,110,246,0.08)' }}>
                <p>Model: <span className="text-slate-600 font-medium">{metrics.model_name}</span> · Version <span className="text-slate-600">{metrics.version}</span></p>
                <p>Classification threshold: <span className="text-slate-600 font-mono">{metrics.threshold}</span></p>
                <p>Confusion matrix (TN / FP / FN / TP): <span className="text-slate-600 font-mono">{metrics.confusion_matrix.flat().join(' / ')}</span></p>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-20" />
              ))}
            </div>
          )}
        </div>

        {/* Risk thresholds */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Risk Level Thresholds</p>
          <div className="space-y-2.5">
            {[
              { level: 'Low',    range: '0.00 – 0.30', color: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { level: 'Medium', range: '0.31 – 0.60', color: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
              { level: 'High',   range: '0.61 – 1.00', color: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
            ].map(({ level, range, color, text, bg, border }) => (
              <div key={level} className={`flex items-center gap-3 rounded-lg border ${bg} ${border} px-4 py-2.5`}>
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className={`text-sm font-semibold w-16 ${text}`}>{level}</span>
                <span className="text-xs text-gray-500 font-mono">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
