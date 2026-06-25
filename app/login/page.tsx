'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from '@/styles/auth/login.module.css'

// ── Only these e-mails may enter the system ──
const ALLOWED_EMAILS = [
  'cucholotto@gmail.com',
  'director@emlider.edu.mx',
  'coordinacion@emlider.edu.mx',
  'computacion@emlider.edu.mx',
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Whitelist check — fail fast before hitting Supabase
    if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
      setError('Este correo no tiene acceso al sistema.')
      return
    }

    setLoading(true)

    // Self-healing auth: try sign-in first, fall back to sign-up
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      if (signInError.message === 'Invalid login credentials') {
        // First time — register the allowed user
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }
      } else {
        setError(signInError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoMark}>EM</div>
          <div>
            <div className={styles.headerSchool}>Colegio Emlider</div>
            <div className={styles.headerDept}>Sistema de Revisión Académica</div>
          </div>
        </div>
      </header>

      {/* ── Centered card ── */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>INSERT COIN</span>
            <h1 className={styles.cardTitle}>Acceso</h1>
            <p className={styles.cardSubtitle}>Dashboard · Coordinación & Dirección</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={`${styles.alertBox} ${styles.error}`}>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@emlider.edu.mx"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.btn}
            >
              {loading ? 'Verificando…' : 'Entrar al sistema'}
            </button>
          </form>

          <div className={styles.accessNote}>
            Acceso restringido · Solo personal autorizado
          </div>
        </div>

        <p className={styles.footer}>EMLIDER © {new Date().getFullYear()}</p>
      </main>
    </div>
  )
}
