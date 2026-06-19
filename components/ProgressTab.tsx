'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { ProjectProgress } from '@/lib/types'

interface Props {
  projectId: string
  progress: ProjectProgress | null
  accentColor: string
  canEdit: boolean
}

const PHASES = [
  { key: 'preproduccion_pct', label: 'Preproducción', icon: '📋' },
  { key: 'produccion_pct', label: 'Producción', icon: '🎬' },
  { key: 'postproduccion_pct', label: 'Postproducción', icon: '🎞' },
] as const

export default function ProgressTab({ projectId, progress, accentColor, canEdit }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [values, setValues] = useState({
    preproduccion_pct: progress?.preproduccion_pct ?? 0,
    produccion_pct: progress?.produccion_pct ?? 0,
    postproduccion_pct: progress?.postproduccion_pct ?? 0,
  })
  const [saving, setSaving] = useState(false)

  const overall = Math.round((values.preproduccion_pct + values.produccion_pct + values.postproduccion_pct) / 3)

  async function save() {
    setSaving(true)
    await supabase
      .from('project_progress')
      .upsert({ project_id: projectId, ...values }, { onConflict: 'project_id' })
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '720px' }}>

      <div style={overallCard}>
        <div>
          <div style={overallLabel}>Progreso General del Proyecto</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '40px', fontWeight: 800, color: accentColor, lineHeight: 1 }}>
            {overall}%
          </div>
        </div>
        <div>
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="#EDE8DC" strokeWidth="8" />
            <circle
              cx="42" cy="42" r="36" fill="none"
              stroke={accentColor} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - overall / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 42 42)"
            />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {PHASES.map(phase => (
          <div key={phase.key}>
            <div style={phaseHeader}>
              <span style={phaseLabel}>
                <span style={{ marginRight: '8px' }}>{phase.icon}</span>
                {phase.label}
              </span>
              <span style={{ ...phasePct, color: accentColor }}>{values[phase.key]}%</span>
            </div>

            <div style={barTrack}>
              <div style={{ ...barFill, width: `${values[phase.key]}%`, background: accentColor }} />
            </div>

            {canEdit && (
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={values[phase.key]}
                onChange={e => setValues(v => ({ ...v, [phase.key]: Number(e.target.value) }))}
                style={{ ...rangeInput, accentColor } as React.CSSProperties}
              />
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <button
          onClick={save}
          disabled={saving}
          style={{ ...saveBtn, background: accentColor, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar progreso'}
        </button>
      )}

      {!canEdit && (
        <p style={readOnlyNote}>
          Solo Computación puede actualizar estos porcentajes. Esta vista es de solo lectura.
        </p>
      )}
    </div>
  )
}

const overallCard: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#FAFAF8',
  border: '1px solid #EDE8DC',
  borderRadius: '14px',
  padding: '24px 28px',
}

const overallLabel: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: '#6B6B72',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

const phaseHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '8px',
}

const phaseLabel: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: '#1C1C1E',
}

const phasePct: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '14px',
  fontWeight: 700,
}

const barTrack: React.CSSProperties = {
  height: '10px',
  background: '#EDE8DC',
  borderRadius: '6px',
  overflow: 'hidden',
}

const barFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '6px',
  transition: 'width 0.3s ease',
}

const rangeInput: React.CSSProperties = {
  width: '100%',
  marginTop: '8px',
  cursor: 'pointer',
}

const saveBtn: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  color: '#FFFFFF',
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.5px',
  cursor: 'pointer',
}

const readOnlyNote: React.CSSProperties = {
  marginTop: '24px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#9B9B9F',
  fontStyle: 'italic',
}
