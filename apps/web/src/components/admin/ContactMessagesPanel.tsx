import { useEffect, useState } from 'react'
import { api } from '../../api'

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export function ContactMessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () =>
    api<ContactMessage[]>('/admin/messages')
      .then(setMessages)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function toggleRead(id: string, read: boolean) {
    await api(`/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) })
    await load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this message?')) return
    await api(`/admin/messages/${id}`, { method: 'DELETE' })
    await load()
  }

  if (loading) return <p className="text-zinc-500 text-sm">Loading messages…</p>
  if (error) return <p className="text-red-400 text-sm">{error}</p>

  if (messages.length === 0) {
    return <p className="text-zinc-500 text-sm">No contact messages yet.</p>
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <article
          key={m.id}
          className={`rounded-xl border p-5 ${
            m.read ? 'border-white/5 bg-white/[0.02]' : 'border-teal-500/30 bg-teal-500/5'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-white font-medium">
                {m.name}
                {!m.read && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-teal-400">New</span>
                )}
              </p>
              <a href={`mailto:${m.email}`} className="text-teal-400 text-sm hover:text-teal-300">
                {m.email}
              </a>
              {m.subject && <p className="text-zinc-400 text-sm mt-1">{m.subject}</p>}
            </div>
            <p className="text-zinc-600 text-xs shrink-0">
              {new Date(m.created_at).toLocaleString()}
            </p>
          </div>
          <p className="text-zinc-400 text-sm mt-4 whitespace-pre-wrap">{m.message}</p>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => toggleRead(m.id, !m.read)}
              className="text-xs text-zinc-500 hover:text-teal-400"
            >
              Mark as {m.read ? 'unread' : 'read'}
            </button>
            <button
              type="button"
              onClick={() => remove(m.id)}
              className="text-xs text-red-400/80 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
