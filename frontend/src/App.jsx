import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Projects from './pages/Projects'
import Project from './pages/Project'
import Analysis from './pages/Analysis'

// Admin & Management
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'

// Team Dashboards
import QualDashboard from './pages/QualDashboard'
import QuantDashboard from './pages/QuantDashboard'

// Client Dashboard
import ClientDashboard from './pages/ClientDashboard'

// Analysis Tools
import OpenEndsCoding from './pages/OpenEndsCoding'
import ConceptTesting from './pages/ConceptTesting'

function Private({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <Private allowedRoles={['super_admin', 'org_admin', 'admin']}>
          <AdminDashboard />
        </Private>
      } />
      <Route path="/admin/users" element={
        <Private allowedRoles={['super_admin', 'org_admin', 'admin']}>
          <UserManagement />
        </Private>
      } />

      {/* Team Dashboards */}
      <Route path="/qual/dashboard" element={
        <Private allowedRoles={['researcher', 'team_lead', 'super_admin', 'org_admin']}>
          <QualDashboard />
        </Private>
      } />
      <Route path="/quant/dashboard" element={
        <Private allowedRoles={['analyst', 'team_lead', 'super_admin', 'org_admin']}>
          <QuantDashboard />
        </Private>
      } />

      {/* Client Dashboard */}
      <Route path="/client/dashboard" element={
        <Private allowedRoles={['client', 'super_admin', 'org_admin']}>
          <ClientDashboard />
        </Private>
      } />

      {/* Analysis Tools */}
      <Route path="/open-ends" element={
        <Private>
          <OpenEndsCoding />
        </Private>
      } />
      <Route path="/concepts" element={
        <Private>
          <ConceptTesting />
        </Private>
      } />

      {/* Original Routes */}
      <Route element={<Private><Layout /></Private>}>
        <Route path="/" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Project />} />
        <Route path="/analyses/:id" element={<Analysis />} />
      </Route>

      {/* Research Routes */}
      <Route path="/research/projects" element={
        <Private allowedRoles={['researcher', 'team_lead', 'super_admin', 'org_admin']}>
          <Projects />
        </Private>
      } />

      {/* Team Lead Dashboard */}
      <Route path="/team/dashboard" element={
        <Private allowedRoles={['team_lead', 'super_admin', 'org_admin']}>
          <QualDashboard />
        </Private>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
