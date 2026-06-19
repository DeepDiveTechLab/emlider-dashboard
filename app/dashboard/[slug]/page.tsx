import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import ProjectViewer from '@/components/ProjectViewer'
import { roleForEmail } from '@/lib/types'

interface Props {
  params: { slug: string }
  searchParams: { tab?: string }
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const supabase = createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  const role = roleForEmail(session?.user?.email || '') || 'alumno'

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!project) notFound()

  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .order('order_index')

  const { data: documents } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', project.id)

  const { data: review } = await supabase
    .from('project_reviews')
    .select('*')
    .eq('project_id', project.id)
    .single()

  const { data: schedule } = await supabase
    .from('shooting_schedule')
    .select('*')

  const { data: progress } = await supabase
    .from('project_progress')
    .select('*')
    .eq('project_id', project.id)
    .single()

  const activeTab = (searchParams.tab as string) || 'guion_literario'

  return (
    <ProjectViewer
      project={project}
      allProjects={allProjects || []}
      documents={documents || []}
      review={review}
      schedule={schedule || []}
      progress={progress}
      activeTab={activeTab}
      userRole={role}
    />
  )
}
