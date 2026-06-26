import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
        Page not found
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0066FF',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
