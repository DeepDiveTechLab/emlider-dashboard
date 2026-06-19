'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Project, ProjectDocument, ProjectReview, ShootingSchedule, ProjectProgress, UserRole } from '@/lib/types'
import ShootingCalendar from './ShootingCalendar'
import ProgressTab from './ProgressTab'

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
  { key: 'creativo',        label: 'Documento Creativo',  icon: '✦' },
  { key: 'guion_literario', label: 'Guion Literario',     icon: '📄' },
  { key: 'guion_tecnico',   label: 'Guion Técnico',       icon: '🎥' },
  { key: 'calendario',      label: 'Calendario de Rodaje', icon: '📅' },
  { key: 'progreso',        label: 'Progreso',            icon: '📊' },
]

const STATUS_CONFIG = {
  sin_revisar:         { label: 'Sin revisar',        color: '#6B6B72', bg: '#F0EFED', border: '#D8D3C8' },
  aprobado:            { label: 'Aprobado ✓',         color: '#2E7D4F', bg: '#EDF6E2', border: '#B8E0C8' },
  requiere_correccion: { label: 'Requiere corrección', color: '#B05E00', bg: '#FFF4E0', border: '#F0D0A0' },
  no_aprobado:         { label: 'No aprobado',        color: '#9B2335', bg: '#FFF0F0', border: '#F5C0C8' },
}

export default function ProjectViewer({ project, allProjects, documents, review, schedule, progress, activeTab, userRole }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [currentTab, setCurrentTab] = useState<TabKey>((activeTab as TabKey) || 'guion_literario')
  const [saving, setSaving] = useState(false)
  const [observations, setObservations] = useState(review?.observations || '')
  const [newStatus, setNewStatus] = useState(review?.status || 'sin_revisar')

  const isAdmin = userRole === 'admin'

  const docTab = currentTab === 'creativo' || currentTab === 'guion_literario' || currentTab === 'guion_tecnico'
  const currentDoc = docTab ? documents.find(d => d.doc_type === currentTab) : null
  const reviewStatus = review?.status || 'sin_revisar'
  const statusInfo = STATUS_CONFIG[reviewStatus]

  async function saveReview() {
    setSaving(true)
    await supabase
      .from('project_reviews')
      .upsert({
        project_id: project.id,
        status: newStatus,
        observations,
        reviewed_at: new Date().toISOString(),
      }, { onConflict: 'project_id' })
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ ...projectHeader, borderBottom: `3px solid ${project.accent_color}` }}>
        <div>
          <div style={projectEyebrow}>{project.genre} · Orden {project.order_index}</div>
          <h2 style={projectTitle}>{project.brand_name}</h2>
          <p style={projectFilm}>"{project.film_title}"</p>
        </div>
        <div style={{
          ...statusPill,
          color: statusInfo.color,
          background: statusInfo.bg,
          border: `1px solid ${statusInfo.border}`,
        }}>
          {statusInfo.label}
        </div>
      </div>

      <div style={tabBar}>
        {TABS.map(tab => {
          const hasDoc = tab.key === 'calendario' || tab.key === 'progreso'
            ? true
            : documents.some(d => d.doc_type === tab.key)
          return (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              style={{
                ...tabBtn,
                borderBottom: currentTab === tab.key ? `2px solid ${project.accent_color}` : '2px solid transparent',
                color: currentTab === tab.key ? '#0B1F3A' : '#6B6B72',
                fontWeight: currentTab === tab.key ? 600 : 400,
                opacity: hasDoc ? 1 : 0.5,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {!hasDoc && <span style={noDocDot} title="Sin contenido" />}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: 0, minHeight: 0 }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          {currentTab === 'calendario' ? (
            <ShootingCalendar projects={allProjects} schedule={schedule} />
          ) : currentTab === 'progreso' ? (
            <ProgressTab projectId={project.id} progress={progress} accentColor={project.accent_color} canEdit={isAdmin} />
          ) : currentDoc?.html_content ? (
            <iframe
              srcDoc={currentDoc.html_content}
              style={iframeStyle}
              title={`${project.brand_name} - ${currentTab}`}
              sandbox="allow-same-origin"
            />
          ) : (
            <EmptyDoc tab={currentTab} accentColor={project.accent_color} />
          )}
        </div>

        {isAdmin && docTab && (
          <aside style={reviewPanel}>
            <div style={reviewTitle}>Revisión y Visto Bueno</div>

            <div style={reviewSection}>
              <label style={reviewLabel}>Estado del proyecto</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                style={selectStyle}
              >
                <option value="sin_revisar">Sin revisar</option>
                <option value="aprobado">Aprobado</option>
                <option value="requiere_correccion">Requiere corrección</option>
                <option value="no_aprobado">No aprobado</option>
              </select>
            </div>

            <div style={reviewSection}>
              <label style={reviewLabel}>Observaciones</label>
              <textarea
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Escribe comentarios para el equipo..."
                rows={8}
                style={textareaStyle}
              />
            </div>

            {review?.reviewed_at && (
              <div style={reviewMeta}>
                Última revisión: {new Date(review.reviewed_at).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            )}

            <button
              onClick={saveReview}
              disabled={saving}
              style={{ ...saveBtn, background: project.accent_color, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando...' : 'Guardar revisión'}
            </button>

            <div style={{ marginTop: '24px' }}>
              <div style={reviewLabel}>Documentos entregados</div>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {TABS.filter(t => t.key !== 'calendario' && t.key !== 'progreso').map(tab => {
                  const has = documents.some(d => d.doc_type === tab.key)
                  return (
                    <div key={tab.key} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ color: has ? '#2E7D4F' : '#D8D3C8', fontSize: '14px' }}>
                        {has ? '✓' : '○'}
                      </span>
                      <span style={{ color: has ? '#1C1C1E' : '#6B6B72' }}>{tab.label}</span>
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

function EmptyDoc({ tab, accentColor }: { tab: TabKey; accentColor: string }) {
  const labels: Record<string, string> = {
    creativo: 'Documento Creativo',
    guion_literario: 'Guion Literario',
    guion_tecnico: 'Guion Técnico',
  }

  return (
    <div style={emptyDoc}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>
        {labels[tab]}
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6B6B72', maxWidth: '340px', lineHeight: '1.6', textAlign: 'center' }}>
        Este documento aún no ha sido cargado en el sistema. El equipo de Computación lo agregará cuando esté disponible.
      </p>
      <div style={{ marginTop: '20px', height: '3px', width: '48px', background: accentColor, borderRadius: '2px' }} />
    </div>
  )
}

const projectHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 28px',
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DC',
  flexShrink: 0,
}

const projectEyebrow: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#6B6B72',
  textTransform: 'uppercase',
  marginBottom: '4px',
}

const projectTitle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '22px',
  fontWeight: 800,
  color: '#0B1F3A',
  marginBottom: '2px',
}

const projectFilm: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#6B6B72',
  fontStyle: 'italic',
}

const statusPill: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: '20px',
  whiteSpace: 'nowrap',
}

const tabBar: React.CSSProperties = {
  display: 'flex',
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DC',
  flexShrink: 0,
  overflowX: 'auto',
}

const tabBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '12px 18px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  whiteSpace: 'nowrap',
  transition: 'color 0.15s',
}

const noDocDot: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#D8D3C8',
}

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: '#FFFFFF',
  minHeight: 'calc(100vh - 200px)',
}

const emptyDoc: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 40px',
  height: '100%',
  minHeight: '400px',
}

const reviewPanel: React.CSSProperties = {
  width: '280px',
  flexShrink: 0,
  background: '#FFFFFF',
  borderLeft: '1px solid #EDE8DC',
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
}

const reviewTitle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '14px',
  fontWeight: 700,
  color: '#0B1F3A',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid #EDE8DC',
}

const reviewSection: React.CSSProperties = {
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const reviewLabel: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  color: '#0B1F3A',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '7px',
  border: '1.5px solid #D8D3C8',
  background: '#FAFAF8',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#1C1C1E',
  cursor: 'pointer',
}

const textareaStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '7px',
  border: '1.5px solid #D8D3C8',
  background: '#FAFAF8',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#1C1C1E',
  resize: 'vertical',
  lineHeight: '1.5',
}

const reviewMeta: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: '#6B6B72',
  marginBottom: '12px',
  fontStyle: 'italic',
}

const saveBtn: React.CSSProperties = {
  padding: '10px',
  borderRadius: '7px',
  border: 'none',
  color: '#FFFFFF',
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: '12px',
  letterSpacing: '0.5px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
}
