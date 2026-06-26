import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import StatusDot from '../components/StatusDot'

function TranscriptRow({ t }) {
  const nav = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function load() { try { setAnalyses(await api.analysesFor(t.id)) } catch { /* ignore */ } }
  useEffect(() => { load() }, [t.id])

  async function analyze() {
    setErr(''); setBusy(true)
    try {
      const a = await api.startAnalysis(t.id)
      nav(`/analyses/${a.id}`)
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  return (
    <div className="card">
      <div className="row between">
        <div>
          <div style={{ fontWeight: 600 }}>{t.title}</div>
          <div className="small muted mono">{t.method} · {new Date(t.created_at).toLocaleDateString('id-ID')}</div>
        </div>
        <button className="btn primary sm" onClick={analyze} disabled={busy}>
          {busy ? 'Memulai…' : 'Analisis'}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
      {analyses.length > 0 && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          {analyses.map((a) => (
            <Link key={a.id} to={`/analyses/${a.id}`} className="row between" style={{ padding: '6px 0' }}>
              <StatusDot status={a.status} />
              <span className="small muted mono">{new Date(a.created_at).toLocaleString('id-ID')} →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Project() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [transcripts, setTranscripts] = useState([])
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState('FGD')
  const [content, setContent] = useState('')
  const [err, setErr] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [p, t] = await Promise.all([api.project(id), api.transcripts(id)])
      setProject(p); setTranscripts(t)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  async function add() {
    setErr(''); setAdding(true)
    try {
      await api.createTranscript(id, title, method, content)
      setTitle(''); setContent(''); await load()
    } catch (e) { setErr(e.message) } finally { setAdding(false) }
  }

  if (loading) return <p className="muted">Memuat…</p>
  if (!project) return <div className="err">{err || 'Proyek tidak ditemukan'}</div>

  return (
    <div>
      <Link to="/" className="small muted mono">← semua proyek</Link>
      <h1 className="page" style={{ marginTop: 10 }}>{project.name}</h1>
      {project.description && <p className="sub">{project.description}</p>}

      <div className="card" style={{ margin: '8px 0 26px' }}>
        <p className="eyebrow" style={{ margin: '0 0 12px' }}>Tambah transkrip</p>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
          <label className="field grow" style={{ marginBottom: 0 }}><span>Judul</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="FGD Sesi 1 — Jakarta" />
          </label>
          <label className="field" style={{ marginBottom: 0, width: 120 }}><span>Metode</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>FGD</option><option>IDI</option><option>other</option>
            </select>
          </label>
        </div>
        <label className="field" style={{ marginTop: 14 }}><span>Isi transkrip</span>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="MODERATOR: ... &#10;RESPONDEN 1: ..." />
        </label>
        {err && <div className="err">{err}</div>}
        <button className="btn primary" onClick={add} disabled={adding || !title || !content.trim()}>
          {adding ? 'Menyimpan…' : 'Simpan transkrip'}
        </button>
      </div>

      <p className="sectionlabel">Transkrip ({transcripts.length})</p>
      {transcripts.length === 0
        ? <p className="muted">Belum ada transkrip.</p>
        : transcripts.map((t) => <div key={t.id} style={{ marginBottom: 10 }}><TranscriptRow t={t} /></div>)}
    </div>
  )
}
