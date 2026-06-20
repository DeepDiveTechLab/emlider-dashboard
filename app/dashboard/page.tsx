import { createServerSupabase } from '@/lib/supabase-server'
import StatCard from '@/components/dashboard/StatCard'
import ProjectCard from '@/components/dashboard/ProjectCard'
import styles from '@/styles/dashboard/dashboard-page.module.css'

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order_index')

  const { data: reviews } = await supabase.from('project_reviews').select('*')

  const { data: docs } = await supabase
    .from('project_documents')
    .select('project_id, doc_type')

  // ── Stats ──
  const totalDocs = docs?.length || 0
  const aprobados = reviews?.filter((r) => r.status === 'aprobado').length || 0
  const pendientes = reviews?.filter((r) => r.status === 'sin_revisar').length || 0

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.sectionHead}>
        <div className={styles.sectionEyebrow}>
          Producción Audiovisual · Ciclo 2024–2025
        </div>
        <h1 className={styles.sectionTitle}>Panel de Control</h1>
      </div>

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Proyectos activos"
          value={projects?.length || 0}
          accent="var(--cobalt)"
        />
        <StatCard
          label="Documentos cargados"
          value={totalDocs}
          accent="var(--violet)"
        />
        <StatCard
          label="Aprobados"
          value={aprobados}
          accent="var(--teal)"
        />
        <StatCard
          label="Sin revisar"
          value={pendientes}
          accent="var(--yellow)"
        />
      </div>

      {/* Projects grid */}
      <div>
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>Listado</div>
          <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--text-xl)' }}>
            Proyectos
          </h2>
        </div>

        {projects && projects.length > 0 ? (
          <div className={styles.projectsGrid}>
            {projects.map((project) => {
              const review = reviews?.find((r) => r.project_id === project.id)
              return (
                <ProjectCard key={project.id} project={project} review={review} />
              )
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>Sin proyectos</div>
            <div className={styles.emptyText}>
              Aún no hay proyectos cargados en el sistema.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
