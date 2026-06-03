import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api'

export type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'checkbox' | 'tags'
  placeholder?: string
  required?: boolean
}

type CrudSectionProps<T extends Record<string, unknown>> = {
  title: string
  apiPath: string
  fields: FieldDef[]
  emptyItem: () => T
  labelKey: keyof T
  onChange?: () => void
}

export function CrudSection<T extends Record<string, unknown> & { id?: string }>({
  title,
  apiPath,
  fields,
  emptyItem,
  labelKey,
  onChange,
}: CrudSectionProps<T>) {
  const [items, setItems] = useState<(T & { id: string })[]>([])
  const [draft, setDraft] = useState<T & { id?: string }>(emptyItem())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<(T & { id: string })[]>(`/admin/${apiPath}`)
      setItems(data)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [apiPath])

  useEffect(() => {
    load()
  }, [load])

  function resetForm() {
    setDraft(emptyItem())
    setEditingId(null)
  }

  function startEdit(item: T & { id: string }) {
    setEditingId(item.id)
    setDraft({ ...item })
    setMsg('')
  }

  function setField(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function serializeBody(data: T & { id?: string }) {
    const body: Record<string, unknown> = { ...data }
    delete body.id
    for (const f of fields) {
      if (f.type === 'tags' && typeof body[f.key] === 'string') {
        body[f.key] = (body[f.key] as string)
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }
    return body
  }

  function displayTags(value: unknown): string {
    return Array.isArray(value) ? value.join(', ') : String(value ?? '')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    const body = serializeBody(draft)
    try {
      if (editingId) {
        await api(`/admin/${apiPath}/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
        setMsg('Updated.')
      } else {
        await api(`/admin/${apiPath}`, {
          method: 'POST',
          body: JSON.stringify({ ...body, order: items.length }),
        })
        setMsg('Added.')
      }
      resetForm()
      await load()
      onChange?.()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err))
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    setMsg('')
    try {
      await api(`/admin/${apiPath}/${id}`, { method: 'DELETE' })
      if (editingId === id) resetForm()
      await load()
      onChange?.()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
      <h2 className="text-white font-semibold text-lg">{title}</h2>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading…</p>
      ) : items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-black/30 border border-white/5"
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{String(item[labelKey] ?? '—')}</p>
                <p className="text-zinc-600 text-xs truncate">{item.id}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-600 text-sm">No entries yet.</p>
      )}

      <form onSubmit={onSubmit} className="space-y-3 pt-2 border-t border-white/10">
        <p className="text-sm text-zinc-400">{editingId ? 'Edit entry' : 'Add new'}</p>
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="text-zinc-500">{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea
                required={f.required}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 min-h-20"
                placeholder={f.placeholder}
                value={String(draft[f.key] ?? '')}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : f.type === 'checkbox' ? (
              <input
                type="checkbox"
                className="ml-2"
                checked={Boolean(draft[f.key])}
                onChange={(e) => setField(f.key, e.target.checked)}
              />
            ) : f.type === 'tags' ? (
              <input
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2"
                placeholder={f.placeholder ?? 'Comma-separated tags'}
                value={displayTags(draft[f.key])}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : (
              <input
                required={f.required}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2"
                placeholder={f.placeholder}
                value={String(draft[f.key] ?? '')}
                onChange={(e) => setField(f.key, e.target.value || (f.key.includes('end') ? null : ''))}
              />
            )}
          </label>
        ))}
        <div className="flex gap-2">
          <button type="submit" className="bg-teal-500 text-black font-semibold px-4 py-2 rounded-lg text-sm">
            {editingId ? 'Save changes' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-sm bg-white/10"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {msg && <p className="text-sm text-teal-400">{msg}</p>}
    </section>
  )
}
