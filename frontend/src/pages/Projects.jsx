import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [usage, setUsage] = useState(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      const [p, u] = await Promise.all([api.projects(), api.usage()])
      setProjects(p); setUsage(u)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function create() {
    setErr(''); setCreating(true)
    try {
      await api.createProject(name, desc)
      setName(''); setDesc(''); await load()
    } catch (e) { setErr(e.message) } finally { setCreating(false) }
  }

  return (
    <div>
      <div className="row between" style={{ alignItems: 'flex-end' }}>
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="page">Proyek</h1>
        </div>
        {usage && (
          <div className="small muted mono" style={{ textAlign: 'right' }}>
            Plan {usage.plan} · {usage.month_count}/{usage.limit} analisis bulan ini
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 18, marginBottom: 28 }}>
        <p className="eyebrow" style={{ margin: '0 0 12px' }}>Proyek baru</p>
        <label className="field"><span>Nama studi</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Studi Kopi Sachet 2026" />
        </label>
        <label className="field"><span>Deskripsi (opsional)</span>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="FGD lintas kota, kategori FMCG" />
        </label>
        <button className="btn primary" onClick={create} disabled={creating || !name}>
          {creating ? 'Membuat…' : 'Buat proyek'}
        </button>
      </div>

      {err && <div className="err">{err}</div>}
      {loading ? <p className="muted">Memuat…</p> : (
        projects.length === 0
          ? <p className="muted">Belum ada proyek. Buat satu di atas untuk mulai.</p>
          : projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card row between" style={{ marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.description && <div className="small muted">{p.description}</div>}
              </div>
              <span className="mono small muted">buka →</span>
            </Link>
          ))
      )}
    </div>
  )
}
