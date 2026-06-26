const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() { return localStorage.getItem('qe_token') }

async function req(path, { method = 'GET', body } = {}) {
  const headers = {}
  let payload
  if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  const t = getToken()
  if (t) headers['Authorization'] = `Bearer ${t}`
  const res = await fetch(BASE + path, { method, headers, body: payload })
  if (!res.ok) {
    let d
    try { d = await res.json() } catch { /* ignore */ }
    throw new Error((d && d.detail) ? d.detail : `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (email, password, org_name) =>
    req('/auth/register', { method: 'POST', body: { email, password, org_name } }),
  login: (email, password) => {
    const f = new URLSearchParams()
    f.set('username', email); f.set('password', password)
    return fetch(BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: f,
    }).then(async (r) => { if (!r.ok) throw new Error('Email atau password salah'); return r.json() })
  },
  me: () => req('/auth/me'),
  usage: () => req('/usage'),
  projects: () => req('/projects'),
  createProject: (name, description) => req('/projects', { method: 'POST', body: { name, description } }),
  project: (id) => req('/projects/' + id),
  transcripts: (pid) => req(`/projects/${pid}/transcripts`),
  createTranscript: (pid, title, method, content) =>
    req(`/projects/${pid}/transcripts`, { method: 'POST', body: { title, method, content } }),
  transcript: (id) => req('/transcripts/' + id),
  analysesFor: (tid) => req(`/transcripts/${tid}/analyses`),
  startAnalysis: (tid) => req(`/transcripts/${tid}/analyses`, { method: 'POST' }),
  analysis: (id) => req('/analyses/' + id),
}
