'use client'

import Link from 'next/link'
import type { Project, ShootingSchedule } from '@/lib/types'
import styles from '@/styles/project/shooting-calendar.module.css'

interface Props {
  projects: Project[]
  schedule: ShootingSchedule[]
}

const DAYS = [17, 18, 19, 20]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM → 7 PM

function dayLabel(day: number) {
  const date = new Date(2025, 6, day) // July 2025
  return {
    weekday: date
      .toLocaleDateString('es-MX', { weekday: 'short' })
      .toUpperCase()
      .replace('.', ''),
    num: day,
  }
}

function hourLabel(h: number) {
  if (h === 12) return '12 PM'
  if (h > 12) return `${h - 12} PM`
  return `${h} AM`
}

function formatTime(time: string) {
  const [hh, mm] = time.split(':').map(Number)
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return mm === 0
    ? `${h12} ${period}`
    : `${h12}:${mm.toString().padStart(2, '0')} ${period}`
}

export default function ShootingCalendar({ projects, schedule }: Props) {
  // Map: day → hour → events
  const byDayHour: Record<number, Record<number, { project: Project; time: string }[]>> = {}

  schedule.forEach((s) => {
    const project = projects.find((p) => p.id === s.project_id)
    if (!project) return
    const date = new Date(s.shoot_date + 'T00:00:00')
    const day = date.getDate()
    const [hh] = s.shoot_time.split(':').map(Number)

    if (!byDayHour[day]) byDayHour[day] = {}
    if (!byDayHour[day][hh]) byDayHour[day][hh] = []
    byDayHour[day][hh].push({ project, time: s.shoot_time })
  })

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.month}>Julio</span>
          <span className={styles.year}>2025</span>
        </div>
        <div className={styles.toolbarMeta}>
          Calendario de Rodaje · Semana de producción
        </div>
      </div>

      {/* Grid */}
      <div className={styles.gridScroll}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `64px repeat(${DAYS.length}, 1fr)`,
          }}
        >
          {/* Header row */}
          <div className={styles.corner} />
          {DAYS.map((day) => {
            const { weekday, num } = dayLabel(day)
            return (
              <div key={day} className={styles.dayHeader}>
                <div className={styles.dayWeekday}>{weekday}</div>
                <div className={styles.dayNum}>{num}</div>
              </div>
            )
          })}

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <>
              <div key={`h-${hour}`} className={styles.hourCell}>
                {hourLabel(hour)}
              </div>
              {DAYS.map((day) => {
                const events = byDayHour[day]?.[hour] || []
                return (
                  <div key={`${day}-${hour}`} className={styles.slotCell}>
                    {events.map((ev) => (
                      <Link
                        key={ev.project.id}
                        href={`/dashboard/${ev.project.slug}`}
                        className={styles.event}
                        style={{
                          background: `${ev.project.accent_color}20`,
                          borderLeft: `3px solid ${ev.project.accent_color}`,
                        }}
                      >
                        <div
                          className={styles.eventTime}
                          style={{ color: ev.project.accent_color }}
                        >
                          {formatTime(ev.time)}
                        </div>
                        <div className={styles.eventTitle}>
                          {ev.project.brand_name}
                        </div>
                        <div className={styles.eventSubtitle}>
                          "{ev.project.film_title}"
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
