'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { WorkHubItem, Comment } from '@/lib/types'

interface Props {
  items: WorkHubItem[]
  comments: Comment[]
}

export default function WorkHubClient({ items, comments }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'items' | 'comments'>('items')

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await supabase.from('work_hub_items').insert({
      title: title.trim(),
      description: description.trim() || null,
      html_content: content.trim() || null,
    })
    setTitle(''); setDescription(''); setContent('')
    setSaving(false)
    router.refresh()
  }

  async function deleteItem(id: string) {
    await supabase.from('work_hub_items').delete().eq('id', id)
    router.refresh()
  }

  async function toggleResolved(id: string, resolved: boolean) {
    await supabase.from('comments').update({ resolved: !resolved }).eq('id', id)
    router.refresh()
  }

  const unresolvedCount = comments.filter(c => !c.resolved).length

  return (
    <div style={{ padding: '32px 40px', maxWidth: '880px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={eyebrow}>SOLO COMPUTACIÓN · ÁREA DE TRABAJO INTERNA</div>
        <h1 style={h1}>Work Hub</h1>
        <p style={sub}>Aquí cargas información y documentos que Coordinación y Dirección verán en sus paneles.</p>
      </div>

      <div style={switchBar}>
        <button
          onClick={() => setView('items')}
          style={{ ...switchBtn, ...(view === 'items' ? switchBtnActive : {}) }}
        >
          Documentos ({items.length})
        </button>
        <button
          onClick={() => setView('comments')}
          style={{ ...switchBtn, ...(view === 'comments' ? switchBtnActive : {}) }}
        >
          Comentarios recibidos {unresolvedCount > 0 && <span style={badge}>{unresolvedCount}</span>}
        </button>
      </div>

      {view === 'items' ? (
        <>
          <form onSubmit={addItem} style={formCard}>
            <div style={formTitle}>Agregar nuevo documento / nota</div>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Descripción breve (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Contenido (texto plano o HTML simple)"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Syne Mono', monospace", fontSize: '13px' }}
            />
            <button type="submit" disabled={saving} style={{ ...submitBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.length === 0 && <p style={emptyText}>Aún no hay documentos en el Work Hub.</p>}
            {items.map(item => (
              <div key={item.id} style={itemCard}>
                <div style={{ flex: 1 }}>
                  <div style={itemTitle}>{item.title}</div>
                  {item.description && <div style={itemDesc}>{item.description}</div>}
                  {item.html_content && (
                    <pre style={itemContent}>{item.html_content.slice(0, 200)}{item.html_content.length > 200 ? '…' : ''}</pre>
                  )}
                  <div style={itemDate}>
                    {new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => deleteItem(item.id)} style={deleteBtn}>Eliminar</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.length === 0 && <p style={emptyText}>No hay comentarios todavía.</p>}
          {comments.map(c => (
            <div key={c.id} style={{ ...commentCard, opacity: c.resolved ? 0.5 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={commentMsg}>{c.message}</div>
                <div style={itemDate}>
                  {new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button onClick={() => toggleResolved(c.id, c.resolved)} style={resolveBtn}>
                {c.resolved ? 'Reabrir' : 'Marcar leído'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const eyebrow: React.CSSProperties = { fontFamily: "'Syne Mono', monospace", fontSize: '11px', letterSpacing: '2px', color: '#6B6B72', marginBottom: '10px', textTransform: 'uppercase' }
const h1: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0B1F3A', marginBottom: '8px' }
const sub: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6B6B72' }

const switchBar: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #EDE8DC' }
const switchBtn: React.CSSProperties = { padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B6B72', borderBottom: '2px solid transparent' }
const switchBtnActive: React.CSSProperties = { color: '#0B1F3A', fontWeight: 600, borderBottom: '2px solid #0B1F3A' }
const badge: React.CSSProperties = { marginLeft: '6px', background: '#9B2335', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }

const formCard: React.CSSProperties = { background: '#FAFAF8', border: '1px solid #EDE8DC', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }
const formTitle: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, color: '#0B1F3A', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #D8D3C8', fontFamily: "'Inter', sans-serif", fontSize: '14px', background: '#fff' }
const submitBtn: React.CSSProperties = { padding: '10px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '4px' }

const itemCard: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '16px', background: '#fff', border: '1px solid #EDE8DC', borderRadius: '10px', padding: '16px 18px' }
const itemTitle: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: '#0B1F3A' }
const itemDesc: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B6B72', marginTop: '2px' }
const itemContent: React.CSSProperties = { fontFamily: "'Syne Mono', monospace", fontSize: '11px', color: '#444', background: '#F8F5EE', padding: '8px 10px', borderRadius: '6px', marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
const itemDate: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#9B9B9F', marginTop: '8px' }
const deleteBtn: React.CSSProperties = { background: 'none', border: '1px solid #F5C0C8', color: '#9B2335', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start', flexShrink: 0 }

const emptyText: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#9B9B9F', fontStyle: 'italic' }

const commentCard: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '16px', background: '#fff', border: '1px solid #EDE8DC', borderRadius: '10px', padding: '16px 18px' }
const commentMsg: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#1C1C1E', lineHeight: '1.5' }
const resolveBtn: React.CSSProperties = { background: 'none', border: '1px solid #D8D3C8', color: '#0B1F3A', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start', flexShrink: 0, whiteSpace: 'nowrap' }
