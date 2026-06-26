export default function StatusDot({ status }) {
  const label = { pending: 'antri', running: 'memproses', done: 'selesai', error: 'gagal' }[status] || status
  return (
    <span className="row" style={{ gap: 7 }}>
      <span className={`dot ${status}`} />
      <span className="statuslbl">{label}</span>
    </span>
  )
}
