'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Comment } from '@/lib/types'
import styles from '@/styles/comentarios/comentarios.module.css'

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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await supabase.from('comments').insert({
      message: message.trim(),
      author_id: user?.id,
    })
    setMessage('')
    setSaving(false)
    router.refresh()
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.eyebrow}>Mensajes hacia Computación</div>
        <h1 className={styles.title}>Comentarios</h1>
        <p className={styles.subtitle}>
          Envía observaciones o solicitudes al equipo de Computación. Ellos
          las revisarán en su Work Hub.
        </p>
      </div>

      {/* ── Send form ── */}
      <form onSubmit={send} className={styles.formCard}>
        <textarea
          className={styles.textarea}
          placeholder="Escribe tu comentario o solicitud..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className={styles.submitBtn}
        >
          {saving ? 'Enviando…' : 'Enviar comentario'}
        </button>
      </form>

      {/* ── History ── */}
      <div className={styles.historySection}>
        <div className={styles.historyLabel}>Tu historial de comentarios</div>
        <div className={styles.historyList}>
          {comments.length === 0 && (
            <p className={styles.empty}>Aún no has enviado comentarios.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className={styles.commentCard}>
              <div className={styles.commentMsg}>{c.message}</div>
              <div className={styles.commentMeta}>
                <span className={styles.commentDate}>
                  {new Date(c.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span
                  className={`${styles.statusTag} ${
                    c.resolved ? styles.statusTagRead : styles.statusTagPending
                  }`}
                >
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
