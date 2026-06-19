'use client'

import type { Project, ShootingSchedule } from '@/lib/types'

interface Props {
  projects: Project[]
  schedule: ShootingSchedule[]
}

const DAYS = [17, 18, 19, 20]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 7AM - 7PM

function dayLabel(day: number) {
  const date = new Date(2025, 6, day) // July = month 6
  return {
    weekday: date.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase().replace('.', ''),
    num: day,
  }
}

function hourLabel(h: number) {
  if (h === 12) return '12 PM'
  if (h > 12) return `${h - 12} PM`
  return `${h} AM`
}

export default function ShootingCalendar({ projects, schedule }: Props) {
  // Map: day -> hour -> events
  const eventsByDayHour: Record<number, Record<number, { project: Project; time: string }[]>> = {}

  schedule.forEach(s => {
    const project = projects.find(p => p.id === s.project_id)
    if (!project) return
    const date = new Date(s.shoot_date + 'T00:00:00')
    const day = date.getDate()
    const [hh] = s.shoot_time.split(':').map(Number)

    if (!eventsByDayHour[day]) eventsByDayHour[day] = {}
    if (!eventsByDayHour[day][hh]) eventsByDayHour[day][hh] = []
    eventsByDayHour[day][hh].push({ project, time: s.shoot_time })
  })

  return (
    <div style={calWrapper}>
      {/* Toolbar */}
      <div style={toolbar}>
        <div style={toolbarLeft}>
          <span style={monthLabel}>Julio</span>
          <span style={yearLabel}>2025</span>
        </div>
        <div style={toolbarRight}>Calendario de Rodaje · Semana de producción</div>
      </div>

      {/* Grid */}
      <div style={gridScroll}>
        <div style={{ ...gridContainer, gridTemplateColumns: `64px repeat(${DAYS.length}, 1fr)` }}>

          {/* Header row */}
          <div style={cornerCell} />
          {DAYS.map(day => {
            const { weekday, num } = dayLabel(day)
            return (
              <div key={day} style={dayHeaderCell}>
                <div style={dayWeekday}>{weekday}</div>
                <div style={dayNum}>{num}</div>
              </div>
            )
          })}

          {/* Hour rows */}
          {HOURS.map(hour => (
            <>
              <div key={`h-${hour}`} style={hourCell}>{hourLabel(hour)}</div>
              {DAYS.map(day => {
                const events = eventsByDayHour[day]?.[hour] || []
                return (
                  <div key={`${day}-${hour}`} style={slotCell}>
                    {events.map(ev => (
                      <a
                        key={ev.project.id}
                        href={`/dashboard/${ev.project.slug}`}
                        style={{
                          ...eventBlock,
                          background: `${ev.project.accent_color}1A`,
                          borderLeft: `3px solid ${ev.project.accent_color}`,
                        }}
                      >
                        <div style={{ ...eventTime, color: ev.project.accent_color }}>
                          {formatTime(ev.time)}
                        </div>
                        <div style={eventTitle}>{ev.project.brand_name}</div>
                        <div style={eventSubtitle}>"{ev.project.film_title}"</div>
                      </a>
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

function formatTime(time: string) {
  const [hh, mm] = time.split(':').map(Number)
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return mm === 0 ? `${h12} ${period}` : `${h12}:${mm.toString().padStart(2, '0')} ${period}`
}

// ── Styles ──
const calWrapper: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid #EDE8DC',
  flexShrink: 0,
}

const toolbarLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
}

const monthLabel: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '20px',
  fontWeight: 800,
  color: '#0B1F3A',
}

const yearLabel: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '20px',
  fontWeight: 400,
  color: '#9B2335',
}

const toolbarRight: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#6B6B72',
}

const gridScroll: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
}

const gridContainer: React.CSSProperties = {
  display: 'grid',
  gridAutoRows: '76px',
  minWidth: '720px',
}

const cornerCell: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DC',
  borderRight: '1px solid #EDE8DC',
  zIndex: 2,
}

const dayHeaderCell: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DC',
  borderRight: '1px solid #EDE8DC',
  textAlign: 'center',
  padding: '10px 4px',
  zIndex: 2,
}

const dayWeekday: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '10px',
  color: '#9B2335',
  fontWeight: 600,
  letterSpacing: '0.5px',
}

const dayNum: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '18px',
  fontWeight: 700,
  color: '#0B1F3A',
  marginTop: '2px',
}

const hourCell: React.CSSProperties = {
  borderRight: '1px solid #EDE8DC',
  borderBottom: '1px solid #F2EFE8',
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: '#9B9B9F',
  textAlign: 'right',
  padding: '4px 8px 0',
}

const slotCell: React.CSSProperties = {
  borderRight: '1px solid #EDE8DC',
  borderBottom: '1px solid #F2EFE8',
  padding: '3px',
  position: 'relative',
}

const eventBlock: React.CSSProperties = {
  display: 'block',
  height: '100%',
  borderRadius: '6px',
  padding: '6px 8px',
  textDecoration: 'none',
  color: 'inherit',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.15s',
}

const eventTime: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '10px',
  fontWeight: 700,
  marginBottom: '2px',
}

const eventTitle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#1C1C1E',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const eventSubtitle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '10px',
  color: '#6B6B72',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
