import Link from 'next/link'
import type { Project, ProjectReview } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import type { ReviewStatus } from '@/lib/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import styles from '@/styles/dashboard/project-card.module.css'

interface ProjectCardProps {
  project: Project
  review?: ProjectReview
}

export default function ProjectCard({ project, review }: ProjectCardProps) {
  const status = (review?.status ?? 'sin_revisar') as ReviewStatus

  return (
    <Link href={`/dashboard/${project.slug}`} className={styles.card}>
      <span
        className={styles.stripe}
        style={{ background: project.accent_color || 'var(--coral)' }}
        aria-hidden="true"
      />
      <div className={styles.body}>
        <div>
          <div className={styles.brandName}>{project.brand_name}</div>
          {project.film_title && (
            <div className={styles.filmTitle}>{project.film_title}</div>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.genre}>{project.genre}</span>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>
    </Link>
  )
}
