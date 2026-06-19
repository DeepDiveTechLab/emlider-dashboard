'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ALLOWED_EMAILS } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!ALLOWED_EMAILS[normalizedEmail]) {
      setError('Este correo no tiene acceso al sistema. Contacta a Computación si crees que es un error.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { full_name: normalizedEmail.split('@')[0], role: ALLOWED_EMAILS[normalizedEmail] } }
        })
        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }
        setError('Cuenta inicializada. Si tu proyecto requiere confirmación por correo, revisa tu bandeja; si no, intenta iniciar sesión de nuevo.')
        setLoading(false)
        return
      }
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <img src="/emlider-logo.png" alt="Emlider Prepa" style={styles.logoImg} />
          <div>
            <div style={styles.headerSchool}>COLEGIO EMLIDER</div>
            <div style={styles.headerDept}>INNOVACIÓN TECNOLÓGICA</div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.filmIcon}>🎬</div>
            <h1 style={styles.title}>Acceder al sistema</h1>
            <p style={styles.subtitle}>
              Producción Audiovisual · Ciclo Escolar 2024–2025
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">Correo institucional</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nombre@emlider.edu.mx"
                style={styles.input}
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={styles.input}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                ...styles.errorBox,
                background: error.includes('inicializada') ? '#EDF6E2' : '#FFF0F0',
                color: error.includes('inicializada') ? '#2E7D4F' : '#9B2335',
                border: `1px solid ${error.includes('inicializada') ? '#B8E0C8' : '#F5C0C8'}`,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div style={styles.switchMode}>
            Acceso restringido a Computación, Coordinación Académica y Dirección Académica.
          </div>
        </div>

        <p style={styles.footer}>
          Sistema de gestión de entregables · Producción Audiovisual NMS
        </p>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0B1F3A 0%, #1A3558 60%, #132848 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  logoImg: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  headerSchool: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    color: '#FFFFFF',
    letterSpacing: '2px',
  },
  headerDept: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: '24px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  cardHeader: {
    background: '#F8F5EE',
    padding: '32px 36px 28px',
    borderBottom: '1px solid #EDE8DC',
    textAlign: 'center',
  },
  filmIcon: {
    fontSize: '32px',
    marginBottom: '12px',
    display: 'block',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#0B1F3A',
    marginBottom: '6px',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: '#6B6B72',
  },
  form: {
    padding: '28px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: '#0B1F3A',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #D8D3C8',
    background: '#FAFAF8',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    color: '#1C1C1E',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorBox: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.5',
  },
  btn: {
    padding: '12px',
    borderRadius: '8px',
    background: '#0B1F3A',
    color: '#FFFFFF',
    border: 'none',
    fontFamily: "'Syne', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  switchMode: {
    padding: '16px 36px 24px',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: '#6B6B72',
    borderTop: '1px solid #EDE8DC',
    lineHeight: '1.5',
  },
  footer: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
}
