import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Projects from './pages/Projects'
import Project from './pages/Project'
import Analysis from './pages/Analysis'

function Private({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Private><Layout /></Private>}>
        <Route path="/" element={<Projects />} />
        <Route path="/projects/:id" element={<Project />} />
        <Route path="/analyses/:id" element={<Analysis />} />
      </Route>
    </Routes>
  )
}
