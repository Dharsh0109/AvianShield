import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AirportOverview from './pages/AirportOverview'
import RunwaySafetyPanel from './pages/RunwaySafetyPanel'
import PredictionHistory from './pages/PredictionHistory'
import AlertManagement from './pages/AlertManagement'
import SyntheticDataUpload from './pages/SyntheticDataUpload'
import SystemStatus from './pages/SystemStatus'
import Login from './pages/Login'

function AppLayout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-page-gradient">
      <Sidebar />
      <div key={location.pathname} className="flex-1 flex flex-col min-w-0 page-enter">
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/airports"      element={<AirportOverview />} />
          <Route path="/airports/:id"  element={<AirportOverview />} />
          <Route path="/runway"        element={<RunwaySafetyPanel />} />
          <Route path="/history"       element={<PredictionHistory />} />
          <Route path="/alerts"        element={<AlertManagement />} />
          <Route path="/upload"        element={<SyntheticDataUpload />} />
          <Route path="/status"        element={<SystemStatus />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"     element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
