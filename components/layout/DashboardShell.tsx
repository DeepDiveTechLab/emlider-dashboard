'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile, Project, ProjectReview } from '@/lib/types'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from '@/styles/layout/shell.module.css'

interface DashboardShellProps {
  profile: Profile | null
  projects: Project[]
  reviews: ProjectReview[]
  userEmail: string
  children: React.ReactNode
}

export default function DashboardShell({
  profile,
  projects,
  reviews,
  userEmail,
  children,
}: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Sync sidebar state with viewport width
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const desktop = e.matches
      setIsDesktop(desktop)
      setSidebarOpen(desktop)
    }

    handleChange(mq)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  // Close sidebar on mobile after navigation
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }, [pathname, isDesktop])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Extract current project slug from path
  const pathParts = pathname.split('/')
  const currentSlug =
    pathParts[2] &&
    pathParts[2] !== 'workhub' &&
    pathParts[2] !== 'comentarios'
      ? pathParts[2]
      : undefined

  return (
    <div className={styles.shell}>
      {/* Mobile/tablet backdrop — tap to close sidebar */}
      {!isDesktop && sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        profile={profile}
        projects={projects}
        reviews={reviews}
        userEmail={userEmail}
        currentSlug={currentSlug}
        pathname={pathname}
        onLogout={handleLogout}
      />

      <div className={styles.main}>
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          pathname={pathname}
          projects={projects}
          currentSlug={currentSlug}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
