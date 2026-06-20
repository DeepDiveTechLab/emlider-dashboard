/**
 * Shared constants — single source of truth for status configs and role labels.
 * Consumed by StatusBadge, NavItem, ReviewPanel, and ProjectCard.
 */

export type ReviewStatus =
  | 'sin_revisar'
  | 'aprobado'
  | 'requiere_correccion'
  | 'no_aprobado'

export type UserRole =
  | 'admin'
  | 'coordinacion'
  | 'direccion'
  | 'docente'
  | 'alumno'

/** WAVE DS colors mapped to each review state. */
export const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  sin_revisar: {
    label: 'Sin revisar',
    color: 'var(--ink-faint)',
    bg: 'var(--paper-2)',
    border: 'var(--ink)',
    dot: 'var(--ink-faint)',
  },
  aprobado: {
    label: 'Aprobado ✓',
    color: 'var(--teal-deep)',
    bg: 'var(--mint)',
    border: 'var(--ink)',
    dot: 'var(--teal)',
  },
  requiere_correccion: {
    label: 'Requiere corrección',
    color: 'var(--ink-soft)',
    bg: 'var(--butter)',
    border: 'var(--ink)',
    dot: 'var(--yellow-deep)',
  },
  no_aprobado: {
    label: 'No aprobado',
    color: 'var(--white)',
    bg: 'var(--coral-deep)',
    border: 'var(--ink)',
    dot: 'var(--coral)',
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:        'Computación',
  coordinacion: 'Coordinación Académica',
  direccion:    'Dirección Académica',
  docente:      'Docente',
  alumno:       'Alumno',
}
