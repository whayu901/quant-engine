import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [org, setOrg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setErr(''); setBusy(true)
    try {
      if (mode === 'login') {
        const userData = await login(email, password)
        console.log('Login successful, user data:', userData)

        // Navigate based on role
        switch(userData.role) {
          case 'super_admin':
          case 'org_admin':
          case 'admin':
            nav('/admin/dashboard')
            break
          case 'team_lead':
            nav('/team/dashboard')
            break
          case 'researcher':
            nav('/research/projects')
            break
          case 'analyst':
            nav('/quant/dashboard')
            break
          case 'client':
            nav('/client/dashboard')
            break
          default:
            nav('/projects')
        }
      } else {
        await register(email, password, org)
        nav('/')
      }
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Kadence · Qual Engine</p>
        <h1 className="page serif" style={{ fontSize: 28 }}>
          {mode === 'login' ? 'Masuk' : 'Buat akun'}
        </h1>
        <p className="sub">Dari transkrip mentah ke topline, dalam menit.</p>

        {mode === 'register' && (
          <label className="field"><span>Nama organisasi</span>
            <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Kadence Indonesia" />
          </label>
        )}
        <label className="field"><span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@kadence.com" />
        </label>
        <label className="field"><span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>

        {err && <div className="err">{err}</div>}

        <button className="btn primary" style={{ width: '100%', marginTop: 6 }} onClick={submit}
          disabled={busy || !email || !password || (mode === 'register' && !org)}>
          {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>

        <p className="small muted" style={{ marginTop: 16, textAlign: 'center' }}>
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <a style={{ color: 'var(--petrol)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setErr(''); setMode(mode === 'login' ? 'register' : 'login') }}>
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </a>
        </p>
      </div>
    </div>
  )
}
