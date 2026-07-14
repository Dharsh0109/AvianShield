import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@avianshield.in' && password === 'admin') {
      navigate('/')
    } else {
      setError('Invalid credentials. Use admin@avianshield.in / admin')
    }
  }

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(59,110,246,0.12)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(109,74,255,0.08)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-brand"
              style={{ background: 'linear-gradient(135deg, #3b6ef6 0%, #6d4aff 100%)' }}>
              <span className="text-2xl">🦅</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">AvianShield</h1>
            <p className="text-xs text-slate-400 mt-1">Bird Strike Intelligence Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none transition-all duration-250"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
                placeholder="admin@avianshield.in"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none transition-all duration-250"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-brand w-full py-2.5 rounded-xl mt-2">
              Sign in to platform
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          AvianShield v1.0.0 · India Airports · Restricted Access
        </p>
      </div>
    </div>
  )
}
