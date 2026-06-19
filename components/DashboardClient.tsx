'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile, Project, ProjectReview, UserRole } from '@/lib/types'

interface Props {
  profile: Profile | null
  projects: Project[]
  reviews: ProjectReview[]
  userEmail: string
  children: React.ReactNode
}

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  sin_revisar:        { dot: '#8C8C8E', label: '–' },
  aprobado:           { dot: '#2E7D4F', label: '✓' },
  requiere_correccion:{ dot: '#B05E00', label: '!' },
  no_aprobado:        { dot: '#9B2335', label: '✗' },
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Computación',
  coordinacion: 'Coordinación Académica',
  direccion: 'Dirección Académica',
  docente: 'Docente',
  alumno: 'Alumno',
}

export default function DashboardClient({ profile, projects, reviews, userEmail, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const currentSlug = pathname.split('/dashboard/')[1]?.split('?')[0]
  const isOverview = pathname === '/dashboard'
  const isWorkHub = pathname === '/dashboard/workhub'
  const role = profile?.role || 'alumno'
  const isAdmin = role === 'admin'

  return (
    <div style={layoutStyle}>
      {/* ── SIDEBAR ── */}
      <aside style={{ ...sidebarStyle, width: sidebarOpen ? '280px' : '0', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: '280px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Brand header */}
          <div style={brandHeader}>
            <img src="/emlider-logo.png" alt="Emlider Prepa" style={brandLogo} />
            <div>
              <div style={brandName}>COLEGIO EMLIDER</div>
              <div style={brandDept}>INNOVACIÓN TECNOLÓGICA</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
            {/* Overview link */}
            <a
              href="/dashboard"
              style={{
                ...navItemStyle,
                background: isOverview ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isOverview ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                borderLeft: isOverview ? '3px solid #FFFFFF' : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '14px' }}>◻</span>
              <span>Panel general</span>
            </a>

            {/* Work Hub (admin) or Comentarios (coordinacion/direccion) */}
            {isAdmin ? (
              <a
                href="/dashboard/workhub"
                style={{
                  ...navItemStyle,
                  background: isWorkHub ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isWorkHub ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  borderLeft: isWorkHub ? '3px solid #6AD1A6' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: '14px' }}>🗂</span>
                <span>Work Hub</span>
              </a>
            ) : (
              <a
                href="/dashboard/comentarios"
                style={{
                  ...navItemStyle,
                  background: pathname === '/dashboard/comentarios' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: pathname === '/dashboard/comentarios' ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  borderLeft: pathname === '/dashboard/comentarios' ? '3px solid #6AD1A6' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: '14px' }}>💬</span>
                <span>Comentarios</span>
              </a>
            )}

            {/* Divider */}
            <div style={navDivider}>PROYECTOS</div>

            {/* Project items */}
            {projects.map(p => {
              const review = reviews.find(r => r.project_id === p.id)
              const status = review?.status || 'sin_revisar'
              const s = STATUS_CONFIG[status]
              const active = currentSlug === p.slug

              return (
                <a
                  key={p.slug}
                  href={`/dashboard/${p.slug}`}
                  style={{
                    ...navItemStyle,
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                    borderLeft: active ? `3px solid ${p.accent_color}` : '3px solid transparent',
                  }}
                >
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: p.accent_color, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: '13px', lineHeight: '1.3' }}>
                    <span style={{ display: 'block', fontWeight: active ? 600 : 400 }}>{p.brand_name}</span>
                    <span style={{ fontSize: '11px', opacity: 0.6, fontStyle: 'italic' }}>"{p.film_title}"</span>
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, color: s.dot,
                    background: 'rgba(255,255,255,0.08)',
                    padding: '1px 5px', borderRadius: '4px',
                  }}>
                    {s.label}
                  </span>
                </a>
              )
            })}
          </nav>

          {/* User footer */}
          <div style={userFooter}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', fontFamily: "'Inter', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || userEmail}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>
                {ROLE_LABELS[role]}
              </div>
            </div>
            <button onClick={handleLogout} style={logoutBtn} title="Cerrar sesión">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={topbar}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={hamburgerBtn}
            title="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '☰'}
          </button>
          <div style={topbarTitle}>
            {isOverview
              ? 'Producción Audiovisual'
              : isWorkHub
              ? 'Work Hub'
              : pathname === '/dashboard/comentarios'
              ? 'Comentarios'
              : projects.find(p => p.slug === currentSlug)?.brand_name || 'Proyecto'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B6B72', fontFamily: "'Syne Mono', monospace" }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

// ── Styles ──
const layoutStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
}

const sidebarStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #0B1F3A 0%, #132848 100%)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'width 0.25s ease',
  borderRight: '1px solid rgba(255,255,255,0.06)',
}

const brandHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '18px 20px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
}

const brandLogo: React.CSSProperties = {
  width: '40px',
  height: '40px',
  objectFit: 'contain',
  flexShrink: 0,
}

const brandName: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: '12px',
  color: '#FFFFFF',
  letterSpacing: '1.5px',
}

const brandDept: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '9px',
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginTop: '1px',
}

const navItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 16px 9px 13px',
  textDecoration: 'none',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  transition: 'background 0.15s',
  cursor: 'pointer',
  borderRadius: '0 8px 8px 0',
  margin: '0 8px 0 0',
}

const navDivider: React.CSSProperties = {
  padding: '16px 20px 6px',
  fontFamily: "'Syne Mono', monospace",
  fontSize: '9px',
  letterSpacing: '2px',
  color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase',
}

const userFooter: React.CSSProperties = {
  padding: '16px 16px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexShrink: 0,
}

const logoutBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  width: '28px',
  height: '28px',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const topbar: React.CSSProperties = {
  height: '52px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '0 24px',
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DC',
  flexShrink: 0,
}

const hamburgerBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#0B1F3A',
  padding: '4px 8px',
  borderRadius: '6px',
  flexShrink: 0,
}

const topbarTitle: React.CSSProperties = {
  flex: 1,
  fontFamily: "'Syne', sans-serif",
  fontSize: '16px',
  fontWeight: 700,
  color: '#0B1F3A',
}
