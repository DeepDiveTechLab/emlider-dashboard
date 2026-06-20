'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { WorkHubItem, Comment } from '@/lib/types'
import styles from '@/styles/workhub/workhub.module.css'

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
    setTitle('')
    setDescription('')
    setContent('')
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

  const unresolvedCount = comments.filter((c) => !c.resolved).length

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.eyebrow}>
          Solo Computación · Área de trabajo interna
        </div>
        <h1 className={styles.title}>Work Hub</h1>
        <p className={styles.subtitle}>
          Aquí cargas información y documentos que Coordinación y Dirección
          verán en sus paneles.
        </p>
      </div>

      {/* ── View switcher ── */}
      <div className={styles.switchBar}>
        <button
          className={`${styles.switchBtn} ${view === 'items' ? styles.switchBtnActive : ''}`}
          onClick={() => setView('items')}
        >
          Documentos ({items.length})
        </button>
        <button
          className={`${styles.switchBtn} ${view === 'comments' ? styles.switchBtnActive : ''}`}
          onClick={() => setView('comments')}
        >
          Comentarios recibidos
          {unresolvedCount > 0 && (
            <span className={styles.badgePill}>{unresolvedCount}</span>
          )}
        </button>
      </div>

      {/* ── Documents view ── */}
      {view === 'items' ? (
        <>
          <form onSubmit={addItem} className={styles.formCard}>
            <div className={styles.formTitle}>Agregar documento / nota</div>
            <input
              className={styles.input}
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Descripción breve (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Contenido (texto plano o HTML simple)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
            <button
              type="submit"
              disabled={saving}
              className={styles.submitBtn}
            >
              {saving ? 'Guardando…' : 'Agregar'}
            </button>
          </form>

          <div className={styles.list}>
            {items.length === 0 && (
              <p className={styles.empty}>
                Aún no hay documentos en el Work Hub.
              </p>
            )}
            {items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  {item.description && (
                    <div className={styles.itemDesc}>{item.description}</div>
                  )}
                  {item.html_content && (
                    <pre className={styles.itemContent}>
                      {item.html_content.slice(0, 200)}
                      {item.html_content.length > 200 ? '…' : ''}
                    </pre>
                  )}
                  <div className={styles.itemDate}>
                    {new Date(item.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteItem(item.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ── Comments view ── */
        <div className={styles.list}>
          {comments.length === 0 && (
            <p className={styles.empty}>No hay comentarios todavía.</p>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className={`${styles.commentCard} ${c.resolved ? styles.resolved : ''}`}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.commentMsg}>{c.message}</div>
                <div className={styles.itemDate}>
                  {new Date(c.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <button
                className={styles.resolveBtn}
                onClick={() => toggleResolved(c.id, c.resolved)}
              >
                {c.resolved ? 'Reabrir' : 'Marcar leído'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
