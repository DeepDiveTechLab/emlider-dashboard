'use client'

import Link from 'next/link'
import styles from '@/styles/layout/navitem.module.css'

/** Standard sidebar nav link (Panel, Work Hub, Comentarios). */
interface NavItemProps {
  href: string
  icon: string            // emoji or single character icon
  label: string
  active: boolean
}

export function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.item} ${active ? styles.active : ''}`}
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

/** Project nav link with color dot, title, film title, and status chip. */
interface ProjectNavItemProps {
  href: string
  accentColor: string
  brandName: string
  filmTitle?: string
  statusLabel: string
  active: boolean
}

export function ProjectNavItem({
  href,
  accentColor,
  brandName,
  filmTitle,
  statusLabel,
  active,
}: ProjectNavItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.item} ${active ? styles.active : ''}`}
    >
      <span
        className={styles.dot}
        style={{ background: accentColor }}
        aria-hidden="true"
      />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className={styles.itemTitle}>{brandName}</span>
        {filmTitle && (
          <span className={styles.itemSubtext}>{filmTitle}</span>
        )}
      </span>
      <span className={styles.statusChip}>{statusLabel}</span>
    </Link>
  )
}
