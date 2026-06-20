import styles from '@/styles/dashboard/stat-card.module.css'

interface StatCardProps {
  label: string
  value: string | number
  accent?: string   // CSS color value for the stripe
  delta?: string    // e.g. "+3" or "-1"
}

export default function StatCard({ label, value, accent, delta }: StatCardProps) {
  const isUp = delta && !String(delta).trim().startsWith('-')

  return (
    <div className={styles.card}>
      {accent && (
        <span className={styles.accent} style={{ background: accent }} aria-hidden="true" />
      )}
      <div className={accent ? styles.inner : ''}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        {delta != null && (
          <div className={`${styles.delta} ${isUp ? styles.up : styles.down}`}>
            {delta}
          </div>
        )}
      </div>
    </div>
  )
}
