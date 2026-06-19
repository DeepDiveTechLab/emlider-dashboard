'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Comment } from '@/lib/types'

interface Props {
  comments: Comment[]
}

export default function ComentariosClient({ comments }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('comments').insert({
      message: message.trim(),
      author_id: user?.id,
    })
    setMessage('')
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={eyebrow}>MENSAJES HACIA COMPUTACIÓN</div>
        <h1 style={h1}>Comentarios</h1>
        <p style={sub}>
          Envía observaciones o solicitudes al equipo de Computación. Ellos las revisarán en su Work Hub.
        </p>
      </div>

      <form onSubmit={send} style={formCard}>
        <textarea
          placeholder="Escribe tu comentario o solicitud..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          style={textareaStyle}
          required
        />
        <button type="submit" disabled={saving} style={{ ...submitBtn, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Enviando...' : 'Enviar comentario'}
        </button>
      </form>

      <div style={{ marginTop: '32px' }}>
        <div style={historyLabel}>Tu historial de comentarios</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {comments.length === 0 && <p style={emptyText}>Aún no has enviado comentarios.</p>}
          {comments.map(c => (
            <div key={c.id} style={commentCard}>
              <div style={commentMsg}>{c.message}</div>
              <div style={commentMeta}>
                <span>{new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ ...statusTag, color: c.resolved ? '#2E7D4F' : '#B05E00', background: c.resolved ? '#EDF6E2' : '#FFF4E0' }}>
                  {c.resolved ? 'Leído por Computación' : 'Pendiente de revisión'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const eyebrow: React.CSSProperties = { fontFamily: "'Syne Mono', monospace", fontSize: '11px', letterSpacing: '2px', color: '#6B6B72', marginBottom: '10px', textTransform: 'uppercase' }
const h1: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0B1F3A', marginBottom: '8px' }
const sub: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6B6B72', lineHeight: '1.6' }

const formCard: React.CSSProperties = { background: '#FAFAF8', border: '1px solid #EDE8DC', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }
const textareaStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #D8D3C8', fontFamily: "'Inter', sans-serif", fontSize: '14px', background: '#fff', resize: 'vertical', lineHeight: '1.5' }
const submitBtn: React.CSSProperties = { padding: '11px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start', paddingLeft: '24px', paddingRight: '24px' }

const historyLabel: React.CSSProperties = { fontFamily: "'Syne Mono', monospace", fontSize: '11px', letterSpacing: '1.5px', color: '#6B6B72', textTransform: 'uppercase' }
const emptyText: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#9B9B9F', fontStyle: 'italic' }

const commentCard: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8DC', borderRadius: '10px', padding: '16px 18px' }
const commentMsg: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#1C1C1E', lineHeight: '1.5', marginBottom: '10px' }
const commentMeta: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#9B9B9F' }
const statusTag: React.CSSProperties = { padding: '3px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '10px' }
