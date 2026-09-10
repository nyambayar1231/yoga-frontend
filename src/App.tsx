import { Navigate, Route, Routes } from 'react-router'
import RequireAuth from '@/routes/RequireAuth'
import RequireGuest from '@/routes/RequireGuest'
import DashboardLayout from '@/layouts/DashboardLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import TeachersPage from '@/pages/TeachersPage'
import StudentsPage from '@/pages/StudentsPage'
import ClassesPage from '@/pages/ClassesPage'
import ClassDetailPage from '@/pages/ClassDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
