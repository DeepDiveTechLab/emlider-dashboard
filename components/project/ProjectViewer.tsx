'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type {
  Project,
  ProjectDocument,
  ProjectReview,
  ShootingSchedule,
  ProjectProgress,
  UserRole,
} from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import type { ReviewStatus } from '@/lib/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import ShootingCalendar from '@/components/project/ShootingCalendar'
import ProgressTab from '@/components/project/ProgressTab'
import styles from '@/styles/project/project-viewer.module.css'

interface Props {
  project: Project
  allProjects: Project[]
  documents: ProjectDocument[]
  review: ProjectReview | null
  schedule: ShootingSchedule[]
  progress: ProjectProgress | null
  activeTab: string
  userRole: UserRole
}

type TabKey = 'creativo' | 'guion_literario' | 'guion_tecnico' | 'calendario' | 'progreso'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'creativo',        label: 'Doc. Creativo',    icon: '✦' },
  { key: 'guion_literario', label: 'Guion Literario',  icon: '◈' },
  { key: 'guion_tecnico',   label: 'Guion Técnico',    icon: '▣' },
  { key: 'calendario',      label: 'Calendario',       icon: '◻' },
  { key: 'progreso',        label: 'Progreso',         icon: '◎' },
]

const DOC_LABELS: Record<string, string> = {
  creativo:        'Documento Creativo',
  guion_literario: 'Guion Literario',
  guion_tecnico:   'Guion Técnico',
}

export default function ProjectViewer({
  project,
  allProjects,
  documents,
  review,
  schedule,
  progress,
  activeTab,
  userRole,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [currentTab, setCurrentTab] = useState<TabKey>(
    (activeTab as TabKey) || 'guion_literario'
  )
  const [saving, setSaving] = useState(false)
  const [observations, setObservations] = useState(review?.observations || '')
  const [newStatus, setNewStatus] = useState<ReviewStatus>(
    (review?.status as ReviewStatus) || 'sin_revisar'
  )

  const isAdmin = userRole === 'admin'
  const isDocTab =
    currentTab === 'creativo' ||
    currentTab === 'guion_literario' ||
    currentTab === 'guion_tecnico'

  const currentDoc = isDocTab
    ? documents.find((d) => d.doc_type === currentTab)
    : null

  const reviewStatus = (review?.status ?? 'sin_revisar') as ReviewStatus
  const accentColor = project.accent_color || 'var(--coral)'

  async function saveReview() {
    setSaving(true)
    await supabase.from('project_reviews').upsert(
      {
        project_id: project.id,
        status: newStatus,
        observations,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    )
    setSaving(false)
    router.refresh()
  }

  return (
    <div className={styles.viewer}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div style={{ borderLeft: `6px solid ${accentColor}`, paddingLeft: 'var(--space-4)' }}>
          <div className={styles.eyebrow}>
            {project.genre} · Orden {project.order_index}
          </div>
          <h2 className={styles.projectTitle}>{project.brand_name}</h2>
          {project.film_title && (
            <p className={styles.filmTitle}>"{project.film_title}"</p>
          )}
        </div>
        <StatusBadge status={reviewStatus} />
      </header>

      {/* ── Tab bar ── */}
      <div className={styles.tabBar} role="tablist">
        {TABS.map((tab) => {
          const hasDoc =
            tab.key === 'calendario' || tab.key === 'progreso'
              ? true
              : documents.some((d) => d.doc_type === tab.key)

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={currentTab === tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`${styles.tab} ${currentTab === tab.key ? styles.tabActive : ''}`}
              style={{
                borderBottomColor:
                  currentTab === tab.key ? accentColor : 'transparent',
                opacity: hasDoc ? 1 : 0.45,
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
              {!hasDoc && (
                <span className={styles.tabMissingDot} title="Sin contenido" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Body: content + review panel ── */}
      <div className={styles.body}>
        <div className={styles.contentArea} role="tabpanel">
          {currentTab === 'calendario' ? (
            <ShootingCalendar projects={allProjects} schedule={schedule} />
          ) : currentTab === 'progreso' ? (
            <ProgressTab
              projectId={project.id}
              progress={progress}
              accentColor={accentColor}
              canEdit={isAdmin}
            />
          ) : currentDoc?.html_content ? (
            <iframe
              srcDoc={currentDoc.html_content}
              className={styles.iframe}
              title={`${project.brand_name} — ${currentTab}`}
              sandbox="allow-same-origin"
            />
          ) : (
            <EmptyDoc tab={currentTab} accentColor={accentColor} />
          )}
        </div>

        {/* Review panel — admin only, doc tabs only */}
        {isAdmin && isDocTab && (
          <aside className={styles.reviewPanel}>
            <div className={styles.reviewPanelTitle}>Revisión</div>

            <div className={styles.reviewSection}>
              <label className={styles.reviewLabel}>Estado del proyecto</label>
              <select
                className={styles.reviewSelect}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReviewStatus)}
              >
                <option value="sin_revisar">Sin revisar</option>
                <option value="aprobado">Aprobado</option>
                <option value="requiere_correccion">Requiere corrección</option>
                <option value="no_aprobado">No aprobado</option>
              </select>
            </div>

            <div className={styles.reviewSection}>
              <label className={styles.reviewLabel}>Observaciones</label>
              <textarea
                className={styles.reviewTextarea}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Escribe comentarios para el equipo..."
                rows={8}
              />
            </div>

            {review?.reviewed_at && (
              <p className={styles.reviewMeta}>
                Última revisión:{' '}
                {new Date(review.reviewed_at).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}

            <button
              className={styles.saveBtn}
              onClick={saveReview}
              disabled={saving}
              style={{ background: accentColor }}
            >
              {saving ? 'Guardando…' : 'Guardar revisión'}
            </button>

            {/* Doc delivery checklist */}
            <div className={styles.reviewSection}>
              <div className={styles.reviewLabel}>Documentos entregados</div>
              <div className={styles.docList}>
                {TABS.filter(
                  (t) => t.key !== 'calendario' && t.key !== 'progreso'
                ).map((tab) => {
                  const has = documents.some((d) => d.doc_type === tab.key)
                  return (
                    <div key={tab.key} className={styles.docListItem}>
                      <span
                        className={styles.docCheck}
                        style={{ color: has ? 'var(--teal)' : 'var(--ink-faint)' }}
                      >
                        {has ? '✓' : '○'}
                      </span>
                      <span style={{ color: has ? 'var(--ink)' : 'var(--ink-faint)' }}>
                        {DOC_LABELS[tab.key]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

/* ── EmptyDoc subcomponent ── */
function EmptyDoc({ tab, accentColor }: { tab: TabKey; accentColor: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon} aria-hidden="true">◻</div>
      <div className={styles.emptyTitle}>{DOC_LABELS[tab]}</div>
      <p className={styles.emptyText}>
        Este documento aún no ha sido cargado. El equipo de Computación lo
        agregará cuando esté disponible.
      </p>
      <div
        className={styles.emptyRule}
        style={{ background: accentColor }}
        aria-hidden="true"
      />
    </div>
  )
}
