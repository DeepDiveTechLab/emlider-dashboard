'use client'

import type { Profile, Project, ProjectReview } from '@/lib/types'
import { STATUS_CONFIG, ROLE_LABELS } from '@/lib/constants'
import type { ReviewStatus, UserRole } from '@/lib/constants'
import { NavItem, ProjectNavItem } from './NavItem'
import styles from '@/styles/layout/sidebar.module.css'

interface SidebarProps {
  open: boolean
  profile: Profile | null
  projects: Project[]
  reviews: ProjectReview[]
  userEmail: string
  currentSlug?: string
  pathname: string
  onLogout: () => void
}

function getStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    sin_revisar: '–',
    aprobado: '✓',
    requiere_correccion: '!',
    no_aprobado: '✕',
  }
  return labels[status] ?? '–'
}

export default function Sidebar({
  open,
  profile,
  projects,
  reviews,
  userEmail,
  currentSlug,
  pathname,
  onLogout,
}: SidebarProps) {
  const role = profile?.role as UserRole | undefined
  const displayName =
    profile?.full_name || userEmail.split('@')[0]

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      {/* ── Brand ── */}
      <div className={styles.brand}>
        <div className={styles.brandInitials} aria-hidden="true">
          EM
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>Emlider</div>
          <div className={styles.brandDept}>Prod. Audiovisual</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className={styles.nav} aria-label="Navegación principal">
        {/* General links */}
        <div className={styles.navSection}>
          <NavItem
            href="/dashboard"
            icon="◈"
            label="Panel general"
            active={pathname === '/dashboard'}
          />
          {role === 'admin' && (
            <NavItem
              href="/dashboard/workhub"
              icon="⬡"
              label="Work Hub"
              active={pathname === '/dashboard/workhub'}
            />
          )}
          <NavItem
            href="/dashboard/comentarios"
            icon="◎"
            label="Comentarios"
            active={pathname === '/dashboard/comentarios'}
          />
        </div>

        {/* Project links */}
        {projects.length > 0 && (
          <div className={styles.navSection}>
            <div className={styles.navDivider}>Proyectos</div>
            {projects.map((project) => {
              const review = reviews.find((r) => r.project_id === project.id)
              const status = (review?.status ?? 'sin_revisar') as ReviewStatus
              return (
                <ProjectNavItem
                  key={project.id}
                  href={`/dashboard/${project.slug}`}
                  accentColor={project.accent_color || 'var(--coral)'}
                  brandName={project.brand_name}
                  filmTitle={project.film_title ?? undefined}
                  statusLabel={getStatusLabel(status)}
                  active={currentSlug === project.slug}
                />
              )
            })}
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <div className={styles.footerName}>{displayName}</div>
          <div className={styles.footerRole}>
            {role ? ROLE_LABELS[role] : userEmail}
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          ↪
        </button>
      </div>
    </aside>
  )
}
