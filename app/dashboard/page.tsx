import { createServerSupabase } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order_index')

  const { data: reviews } = await supabase
    .from('project_reviews')
    .select('*')

  const { data: docs } = await supabase
    .from('project_documents')
    .select('project_id, doc_type')

  const totalDocs = docs?.length || 0
  const aprobados = reviews?.filter(r => r.status === 'aprobado').length || 0
  const pendientes = reviews?.filter(r => r.status === 'sin_revisar').length || 0
  const correccion = reviews?.filter(r => r.status === 'requiere_correccion').length || 0

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    sin_revisar:       { label: 'Sin revisar',        color: '#6B6B72', bg: '#F0EFED' },
    aprobado:          { label: 'Aprobado',            color: '#2E7D4F', bg: '#EDF6E2' },
    requiere_correccion: { label: 'Con correcciones', color: '#B05E00', bg: '#FFF4E0' },
    no_aprobado:       { label: 'No aprobado',        color: '#9B2335', bg: '#FFF0F0' },
  }

  return (
    <div style={{ padding: '40px', maxWidth: '960px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={eyebrowStyle}>PRODUCCIÓN AUDIOVISUAL · CICLO 2024–2025</div>
        <h1 style={h1Style}>Panel de Control</h1>
        <p style={subStyle}>
          Seguimiento de entregables para los 9 proyectos de cortometraje publicitario
        </p>
      </div>

      {/* Stats row */}
      <div style={statsGrid}>
        <StatCard value={projects?.length || 0} label="Proyectos activos" color="#0B1F3A" />
        <StatCard value={totalDocs} label="Documentos cargados" color="#1A3558" />
        <StatCard value={aprobados} label="Aprobados" color="#2E7D4F" />
        <StatCard value={pendientes} label="Sin revisar" color="#6B6B72" />
      </div>

      {/* Projects grid */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={h2Style}>Proyectos</h2>
        <div style={projectsGrid}>
          {projects?.map(p => {
            const review = reviews?.find(r => r.project_id === p.id)
            const statusInfo = review ? statusLabels[review.status] : statusLabels['sin_revisar']
            const docsCount = docs?.filter(d => d.project_id === p.id).length || 0

            return (
              <a key={p.id} href={`/dashboard/${p.slug}`} style={projectCardStyle}>
                {/* Color accent bar */}
                <div style={{ height: '4px', background: p.accent_color, borderRadius: '2px 2px 0 0', margin: '-20px -20px 16px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={cardBrandStyle}>{p.brand_name}</div>
                    <div style={cardTitleStyle}>"{p.film_title}"</div>
                    <div style={cardGenreStyle}>{p.genre}</div>
                  </div>
                  <div style={{
                    ...statusBadge,
                    color: statusInfo.color,
                    background: statusInfo.bg,
                  }}>
                    {statusInfo.label}
                  </div>
                </div>

                <div style={cardFooter}>
                  <span style={docsCount > 0 ? docsCountStyleFull : docsCountStyle}>
                    {docsCount}/4 documentos
                  </span>
                  <span style={arrowStyle}>→</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #D8D3C8', borderRadius: '12px', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B6B72', marginTop: '6px' }}>{label}</div>
    </div>
  )
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#6B6B72',
  marginBottom: '10px',
  textTransform: 'uppercase',
}

const h1Style: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '32px',
  fontWeight: 800,
  color: '#0B1F3A',
  marginBottom: '8px',
}

const subStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '15px',
  color: '#6B6B72',
}

const h2Style: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '18px',
  fontWeight: 700,
  color: '#0B1F3A',
  marginBottom: '20px',
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '16px',
}

const projectsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '16px',
}

const projectCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #D8D3C8',
  borderRadius: '12px',
  padding: '20px',
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  transition: 'box-shadow 0.2s, transform 0.2s',
  cursor: 'pointer',
}

const cardBrandStyle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '15px',
  fontWeight: 700,
  color: '#0B1F3A',
  marginBottom: '2px',
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#1C1C1E',
  fontStyle: 'italic',
  marginBottom: '4px',
}

const cardGenreStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: '#6B6B72',
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const statusBadge: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: '20px',
  letterSpacing: '0.3px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const cardFooter: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid #EDE8DC',
  paddingTop: '12px',
  marginTop: 'auto',
}

const docsCountStyle: React.CSSProperties = {
  fontFamily: "'Syne Mono', monospace",
  fontSize: '11px',
  color: '#6B6B72',
}

const docsCountStyleFull: React.CSSProperties = {
  ...docsCountStyle,
  color: '#2E7D4F',
}

const arrowStyle: React.CSSProperties = {
  color: '#0B1F3A',
  fontSize: '14px',
  fontFamily: "'Inter', sans-serif",
}
