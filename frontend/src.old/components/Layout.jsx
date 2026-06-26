import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Kadence&nbsp;·&nbsp;<b>Qual Engine</b></Link>
        <div className="right">
          <span className="small">{user?.email}</span>
          <button className="btn ghost sm" onClick={() => { logout(); nav('/login') }}>Keluar</button>
        </div>
      </header>
      <main className="container"><Outlet /></main>
    </>
  )
}
