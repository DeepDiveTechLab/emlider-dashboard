'use client'

import type { Project } from '@/lib/types'
import styles from '@/styles/layout/topbar.module.css'

interface TopbarProps {
  sidebarOpen: boolean
  onToggle: () => void
  pathname: string
  projects: Project[]
  currentSlug?: string
}

function getPageTitle(pathname: string, projects: Project[], currentSlug?: string): string {
  if (pathname === '/dashboard') return 'Panel General'
  if (pathname === '/dashboard/workhub') return 'Work Hub'
  if (pathname === '/dashboard/comentarios') return 'Comentarios'
  if (currentSlug) {
    const project = projects.find((p) => p.slug === currentSlug)
    if (project) return project.brand_name
  }
  return 'Dashboard'
}

function formatDate(): string {
  return new Date().toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default function Topbar({
  sidebarOpen,
  onToggle,
  pathname,
  projects,
  currentSlug,
}: TopbarProps) {
  const title = getPageTitle(pathname, projects, currentSlug)

  return (
    <header className={styles.topbar}>
      <button
        className={styles.hamburger}
        onClick={onToggle}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <h1 className={styles.title}>{title}</h1>

      <time className={styles.date} suppressHydrationWarning>
        {formatDate()}
      </time>
    </header>
  )
}
