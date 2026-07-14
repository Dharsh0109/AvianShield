import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// ── Simple TTL cache (60 s) ───────────────────────────────────────────────────
const _cache = new Map<string, { data: unknown; ts: number }>()
const TTL = 60_000

function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = _cache.get(key)
  if (hit && Date.now() - hit.ts < TTL) return Promise.resolve(hit.data as T)
  return fetcher().then(data => { _cache.set(key, { data, ts: Date.now() }); return data })
}

export function invalidateCache(prefix?: string) {
  if (!prefix) { _cache.clear(); return }
  _cache.forEach((_, k) => { if (k.startsWith(prefix)) _cache.delete(k) })
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Airport {
  airport_id:      number
  airport_code:    string
  airport_name:    string
  latitude:        number
  longitude:       number
  habitat_profile: string
  elevation:       number | null
}

export interface WeatherSnapshot {
  weather_id:       number
  airport_id:       number
  observation_time: string
  temperature:      number | null
  visibility:       number | null
  wind_speed:       number | null
  precipitation:    number | null
  cloud_cover:      number | null
}

export interface TopFactor {
  feature:    string
  shap_value: number
}

export interface Prediction {
  window_id:             number | null
  airport_id:            number
  window_start:          string
  window_end:            string
  predicted_probability: number
  risk_level:            'Low' | 'Medium' | 'High'
  model_version:         string
  top_factors:           TopFactor[]
}

export interface PredictRequest {
  airport_id:    number
  temperature:   number
  visibility:    number
  wind_speed:    number
  precipitation: number
  cloud_cover:   number
  hour:          number
  month:         number
}

export interface DispatchAlert {
  alert_id:           number
  airport_id:         number
  window_id:          number
  alert_message:      string
  alert_level:        'Low' | 'Medium' | 'High'
  recommended_action: string
  status:             string
  created_at:         string
}

export interface ModelMetrics {
  model_name:       string
  version:          string
  threshold:        number
  precision:        number
  recall:           number
  f1_score:         number
  pr_auc:           number
  confusion_matrix: number[][]
}

// ── Airports ─────────────────────────────────────────────────────────────────

export const getAirports = () =>
  cached('airports', () => api.get<Airport[]>('/airports').then(r => r.data))

export const getAirport = (id: number) =>
  cached(`airport:${id}`, () => api.get<Airport>(`/airports/${id}`).then(r => r.data))

// ── Weather ──────────────────────────────────────────────────────────────────

export const getWeather = (id: number, limit = 24) =>
  cached(`weather:${id}:${limit}`, () => api.get<WeatherSnapshot[]>(`/airports/${id}/weather`, { params: { limit } }).then(r => r.data))

export const getLiveWeather = (id: number) =>
  api.get(`/airports/${id}/weather/live`).then(r => r.data)

// ── Predictions ──────────────────────────────────────────────────────────────

export const getRisk = (id: number) =>
  cached(`risk:${id}`, () => api.get<Prediction>(`/airports/${id}/risk`).then(r => r.data))

export const postPredict = (body: PredictRequest) =>
  api.post<Prediction>('/predict', body).then(r => r.data)

export const getPredictionHistory = (id: number, limit = 48) =>
  cached(`history:${id}:${limit}`, () => api.get<Prediction[]>(`/airports/${id}/predictions`, { params: { limit } }).then(r => r.data))

// ── Alerts ───────────────────────────────────────────────────────────────────

export const getAlerts = (limit = 100) =>
  cached(`alerts:${limit}`, () => api.get<DispatchAlert[]>('/alerts', { params: { limit } }).then(r => r.data))

export const getAirportAlerts = (id: number) =>
  cached(`alerts:airport:${id}`, () => api.get<DispatchAlert[]>(`/airports/${id}/alerts`).then(r => r.data))

export const patchAlertStatus = (alertId: number, status: string) => {
  invalidateCache('alerts')
  return api.patch<DispatchAlert>(`/alerts/${alertId}`, { status }).then(r => r.data)
}

// ── Upload ───────────────────────────────────────────────────────────────────

export const uploadCSV = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload', form).then(r => r.data)
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export const getMetrics = () =>
  cached('metrics', () => api.get<ModelMetrics>('/model/metrics').then(r => r.data))

export default api
