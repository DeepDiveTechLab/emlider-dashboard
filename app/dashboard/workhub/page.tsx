import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { roleForEmail } from '@/lib/types'
import WorkHubClient from '@/components/WorkHubClient'

export default async function WorkHubPage() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const role = roleForEmail(session?.user?.email || '')

  if (role !== 'admin') redirect('/dashboard')

  const { data: items } = await supabase
    .from('work_hub_items')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  return <WorkHubClient items={items || []} comments={comments || []} />
}
