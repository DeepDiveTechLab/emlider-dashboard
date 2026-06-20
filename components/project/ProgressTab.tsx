'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { ProjectProgress } from '@/lib/types'
import styles from '@/styles/project/progress-tab.module.css'

interface Props {
  projectId: string
  progress: ProjectProgress | null
  accentColor: string
  canEdit: boolean
}

const PHASES = [
  { key: 'preproduccion_pct', label: 'Preproducción', icon: '◻' },
  { key: 'produccion_pct',    label: 'Producción',    icon: '▣' },
  { key: 'postproduccion_pct', label: 'Postproducción', icon: '◈' },
] as const

export default function ProgressTab({
  projectId,
  progress,
  accentColor,
  canEdit,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [values, setValues] = useState({
    preproduccion_pct:   progress?.preproduccion_pct   ?? 0,
    produccion_pct:      progress?.produccion_pct      ?? 0,
    postproduccion_pct:  progress?.postproduccion_pct  ?? 0,
  })
  const [saving, setSaving] = useState(false)

  const overall = Math.round(
    (values.preproduccion_pct + values.produccion_pct + values.postproduccion_pct) / 3
  )

  async function save() {
    setSaving(true)
    await supabase
      .from('project_progress')
      .upsert({ project_id: projectId, ...values }, { onConflict: 'project_id' })
    setSaving(false)
    router.refresh()
  }

  const circumference = 2 * Math.PI * 36

  return (
    <div className={styles.page}>
      {/* ── Overall card ── */}
      <div className={styles.overallCard}>
        <div>
          <div className={styles.overallLabel}>Progreso General</div>
          <div
            className={styles.overallValue}
            style={{ color: accentColor }}
          >
            {overall}%
          </div>
        </div>
        {/* SVG circle gauge */}
        <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
          <circle
            cx="42" cy="42" r="36"
            fill="none"
            stroke="var(--paper-2)"
            strokeWidth="8"
          />
          <circle
            cx="42" cy="42" r="36"
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - overall / 100)}
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
          />
        </svg>
      </div>

      {/* ── Phase bars ── */}
      <div className={styles.phases}>
        {PHASES.map((phase) => (
          <div key={phase.key}>
            <div className={styles.phaseHeader}>
              <span className={styles.phaseLabel}>
                <span aria-hidden="true" style={{ marginRight: '6px' }}>
                  {phase.icon}
                </span>
                {phase.label}
              </span>
              <span className={styles.phasePct} style={{ color: accentColor }}>
                {values[phase.key]}%
              </span>
            </div>

            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${values[phase.key]}%`,
                  background: accentColor,
                }}
              />
            </div>

            {canEdit && (
              <input
                className={styles.range}
                type="range"
                min={0}
                max={100}
                step={5}
                value={values[phase.key]}
                style={{ accentColor } as React.CSSProperties}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [phase.key]: Number(e.target.value),
                  }))
                }
                aria-label={`${phase.label} porcentaje`}
              />
            )}
          </div>
        ))}
      </div>

      {canEdit ? (
        <button
          className={styles.saveBtn}
          onClick={save}
          disabled={saving}
          style={{ background: accentColor }}
        >
          {saving ? 'Guardando…' : 'Guardar progreso'}
        </button>
      ) : (
        <p className={styles.readOnly}>
          Solo Computación puede actualizar estos porcentajes. Vista de solo lectura.
        </p>
      )}
    </div>
  )
}
