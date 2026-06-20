import { STATUS_CONFIG } from '@/lib/constants'
import type { ReviewStatus } from '@/lib/constants'
import styles from '@/styles/ui/status-badge.module.css'

interface StatusBadgeProps {
  status: ReviewStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.sin_revisar

  return (
    <span
      className={`${styles.badge} ${size === 'sm' ? styles.sm : ''}`}
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <span
        className={styles.dot}
        style={{ background: config.dot }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}
