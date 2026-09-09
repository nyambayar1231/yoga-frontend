import { Navigate, Route, Routes } from 'react-router'
import RequireAuth from '@/routes/RequireAuth'
import RequireGuest from '@/routes/RequireGuest'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
