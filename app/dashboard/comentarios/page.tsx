import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { roleForEmail } from '@/lib/types'
import ComentariosClient from '@/components/ComentariosClient'

export default async function ComentariosPage() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const role = roleForEmail(session?.user?.email || '')

  if (role !== 'coordinacion' && role !== 'direccion') redirect('/dashboard')

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('author_id', session?.user?.id)
    .order('created_at', { ascending: false })

  return <ComentariosClient comments={comments || []} />
}
