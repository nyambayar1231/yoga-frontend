import { Navigate, Route, Routes } from 'react-router'
import RequireAuth from '@/routes/RequireAuth'
import RequireGuest from '@/routes/RequireGuest'
import DashboardLayout from '@/layouts/DashboardLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import ClassTypesPage from '@/pages/ClassTypesPage'
import SchedulePage from '@/pages/SchedulePage'
import MembersPage from '@/pages/MembersPage'
import InstructorsPage from '@/pages/InstructorsPage'

function App() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/class-types" element={<ClassTypesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
