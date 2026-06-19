import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DashboardClient from '@/components/DashboardClient'
import { roleForEmail } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const email = session.user.email || ''
  const allowedRole = roleForEmail(email)

  // Enforce the email whitelist even if a session somehow exists for another account
  if (!allowedRole) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Fetch profile; ensure role matches the allowed list (self-heals stale roles)
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile && profile.role !== allowedRole) {
    await supabase.from('profiles').update({ role: allowedRole }).eq('id', session.user.id)
    profile = { ...profile, role: allowedRole }
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order_index')

  const { data: reviews } = await supabase
    .from('project_reviews')
    .select('*')

  return (
    <DashboardClient
      profile={profile}
      projects={projects || []}
      reviews={reviews || []}
      userEmail={email}
    >
      {children}
    </DashboardClient>
  )
}
