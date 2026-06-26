import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import StatusDot from '../components/StatusDot'

const COLORS = [
  { fill: '#FBE6A0', line: '#E9CB5E' },
  { fill: '#C2E5D2', line: '#86C9A8' },
  { fill: '#C8DCF4', line: '#8FB8E6' },
  { fill: '#F4CAD7', line: '#E59CB2' },
  { fill: '#E2D2F1', line: '#C2A5E2' },
]

// split transcript into colored segments based on verbatim quotes
function buildSegments(transcript, marks) {
  const matches = []
  marks.forEach((m) => {
    if (!m.quote) return
    const q = m.quote.trim().replace(/^["'“”]|["'“”]$/g, '')
    let idx = transcript.indexOf(q)
    let len = q.length
    if (idx < 0) { const probe = q.slice(0, Math.min(45, q.length)); idx = transcript.indexOf(probe); len = probe.length }
    if (idx >= 0) matches.push({ start: idx, end: idx + len, fill: m.fill })
  })
  matches.sort((a, b) => a.start - b.start)
  const merged = []; let last = -1
  matches.forEach((m) => { if (m.start >= last) { merged.push(m); last = m.end } })
  if (!merged.length) return [{ text: transcript }]
  const segs = []; let cur = 0
  merged.forEach((m) => {
    if (m.start > cur) segs.push({ text: transcript.slice(cur, m.start) })
    segs.push({ text: transcript.slice(m.start, m.end), fill: m.fill })
    cur = m.end
  })
  if (cur < transcript.length) segs.push({ text: transcript.slice(cur) })
  return segs
}

export default function Analysis() {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [err, setErr] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    let alive = true
    async function tick() {
      try {
        const res = await api.analysis(id)
        if (!alive) return
        setA(res)
        if (!transcript) { try { setTranscript(await api.transcript(res.transcript_id)) } catch { /* ignore */ } }
        if (res.status === 'pending' || res.status === 'running') {
          timer.current = setTimeout(tick, 2000)
        }
      } catch (e) { if (alive) setErr(e.message) }
    }
    tick()
    return () => { alive = false; if (timer.current) clearTimeout(timer.current) }
  }, [id])

  const segments = useMemo(() => {
    if (!a || !transcript || a.status !== 'done') return null
    const marks = []
    a.themes.forEach((t, i) => (t.verbatims || []).forEach((v) =>
      marks.push({ quote: v.quote, fill: COLORS[i % COLORS.length].fill })))
    return buildSegments(transcript.content, marks)
  }, [a, transcript])

  if (err) return <div className="err">{err}</div>
  if (!a) return <p className="muted">Memuat…</p>

  const working = a.status === 'pending' || a.status === 'running'

  return (
    <div>
      <Link to={transcript ? `/projects/${transcript.project_id}` : '/'} className="small muted mono">← kembali</Link>
      <div className="row between" style={{ marginTop: 10, marginBottom: 8 }}>
        <h1 className="page" style={{ margin: 0 }}>{transcript?.title || 'Analisis'}</h1>
        <StatusDot status={a.status} />
      </div>

      {working && (
        <div className="card row" style={{ gap: 12 }}>
          <span className="spin" />
          <span className="muted">Agent sedang bekerja — koding tema, menarik verbatim, menyusun topline…</span>
        </div>
      )}
      {a.status === 'error' && <div className="err">Analisis gagal: {a.error || 'unknown error'}</div>}

      {a.status === 'done' && (
        <>
          <div className="topline">
            <p className="eyebrow" style={{ color: '#9aa0a6' }}>Topline</p>
            <p className="serif">{a.topline}</p>
            <div className="meta">
              <div>Responden<b>{a.respondent_count ?? '—'}</b></div>
              <div>Tema<b>{a.themes.length}</b></div>
              <div>Token<b>{(a.input_tokens || 0) + (a.output_tokens || 0)}</b></div>
            </div>
          </div>

          {segments && (
            <>
              <p className="sectionlabel">Transkrip terkoding</p>
              <div className="coded">
                {segments.map((s, i) => s.fill
                  ? <mark key={i} style={{ background: s.fill }}>{s.text}</mark>
                  : <span key={i}>{s.text}</span>)}
              </div>
            </>
          )}

          <p className="sectionlabel">Tema &amp; verbatim</p>
          {a.themes.map((t, i) => {
            const c = COLORS[i % COLORS.length]
            return (
              <div className="theme" key={t.id}>
                <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
                  <span className="swatch" style={{ background: c.fill, border: `1px solid ${c.line}`, marginTop: 4 }} />
                  <div className="grow">
                    <h3>{t.name}</h3>
                    <div className="small muted">{t.description}</div>
                  </div>
                  <div className="tags">
                    {t.prevalence && <span className="tag">Prevalensi: {t.prevalence}</span>}
                    {t.sentiment && <span className="tag">{t.sentiment}</span>}
                  </div>
                </div>
                {(t.verbatims || []).map((v, j) => (
                  <div className="vb" key={j} style={{ borderColor: c.line }}>
                    <blockquote>“{v.quote}”</blockquote>
                    {v.speaker && <cite>— {v.speaker}</cite>}
                  </div>
                ))}
              </div>
            )
          })}

          {a.implications.length > 0 && (
            <>
              <p className="sectionlabel">Implikasi bisnis</p>
              <ol className="impl">
                {a.implications.map((im, i) => <li key={i}>{im.text}</li>)}
              </ol>
            </>
          )}
        </>
      )}
    </div>
  )
}
