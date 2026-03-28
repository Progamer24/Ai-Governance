import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthGuard from './components/security/AuthGuard'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import { AppToaster } from './components/ui/Toast'

import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import AssistantPage from './pages/AIAssistant/AssistantPage'
import AuditPage from './pages/AuditLogs/AuditPage'
import ProfilePage from './pages/MyProfile/ProfilePage'

import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UsersPage from './pages/Admin/UserManagement/UsersPage'
import RolesPage from './pages/Admin/RoleManagement/RolesPage'
import PoliciesPage from './pages/Admin/PolicyManagement/PoliciesPage'
import ThreatPage from './pages/Admin/ThreatMonitor/ThreatPage'
import ReportsPage from './pages/Admin/Reports/ReportsPage'
import SettingsPage from './pages/Admin/SystemSettings/SettingsPage'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/assistant': 'AI Assistant',
    '/audit': 'Audit Logs',
    '/profile': 'My Profile',
    '/admin': 'Admin',
  }
  const title = pageTitles[location.pathname] ?? 'NRL Shield'

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}
      >
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} title={title} />
        <main className="flex-1 pt-14">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="policies" element={<PoliciesPage />} />
              <Route path="threats" element={<ThreatPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <AppToaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        />
      </Routes>
    </>
  )
}

export default App
