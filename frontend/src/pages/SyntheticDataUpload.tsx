import { useState } from 'react'
import TopNavbar from '../components/TopNavbar'
import { uploadCSV } from '../services/api'

export default function SyntheticDataUpload() {
  const [file,    setFile]    = useState<File | null>(null)
  const [result,  setResult]  = useState<{ inserted: number; total_rows: number } | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await uploadCSV(file)
      setResult(res)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <TopNavbar title="Synthetic Data Upload" subtitle="Batch-ingest new synthetic strike CSV files" />
      <main className="flex-1 p-6 max-w-2xl space-y-5">
        {/* Info card */}
        <div className="bg-brand-600/10 border border-brand-600/20 rounded-xl p-4 flex gap-3">
          <svg className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-brand-300 mb-1">Required CSV columns</p>
            <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
              airport_code · time · strike_occurred · strike_probability · f_season · f_dawn_dusk · f_weather · f_base
            </p>
          </div>
        </div>

        {/* Upload card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Upload CSV File</h3>

          {/* Drop zone */}
          <div
            onClick={() => document.getElementById('csv-input')?.click()}
            className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-250 interactive"
            style={file ? {
              border: '2px dashed rgba(59,110,246,0.4)',
              background: 'rgba(59,110,246,0.04)',
            } : {
              border: '2px dashed rgba(59,110,246,0.15)',
              background: 'rgba(255,255,255,0.4)',
            }}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,110,246,0.1)', border: '1px solid rgba(59,110,246,0.2)' }}>
                  <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-brand-600">{file.name}</p>
                <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,110,246,0.06)', border: '1px solid rgba(59,110,246,0.12)' }}>
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Click to select a CSV file</p>
                <p className="text-[11px] text-slate-400">Only .csv files are accepted</p>
              </div>
            )}
            <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-brand w-full py-2.5 rounded-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </span>
            ) : 'Upload File'}
          </button>

          {result && (
            <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-emerald-400">
                Inserted <strong>{result.inserted}</strong> of <strong>{result.total_rows}</strong> rows successfully.
              </p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
