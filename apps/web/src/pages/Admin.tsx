import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CRUD_SECTIONS, SECTION_NAV } from '../adminSections'
import { api, login } from '../api'
import { ContactMessagesPanel } from '../components/admin/ContactMessagesPanel'
import { CrudSection } from '../components/admin/CrudSection'
import type { Content, Profile, SectionKey } from '../types'

export function Admin() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState<Content | null>(null)
  const [msg, setMsg] = useState('')
  const [active, setActive] = useState<SectionKey | 'messages'>('profile')

  const load = () => api<Content>('/admin/content').then(setContent)

  useEffect(() => {
    if (token) load().catch(() => setToken(null))
  }, [token])

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    await login(email, password)
    setToken(localStorage.getItem('token'))
  }

  async function saveProfile(p: Profile) {
    setMsg('')
    await api('/admin/profile', { method: 'PUT', body: JSON.stringify(p) })
    setMsg('Profile saved.')
    await load()
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 admin-page">
        <form onSubmit={onLogin} className="w-full max-w-sm space-y-4 bg-white/5 p-8 rounded-2xl border border-white/10">
          <h1 className="text-white text-xl font-bold">Admin</h1>
          <input
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-teal-500 text-black font-semibold py-2 rounded-lg">
            Login
          </button>
          <Link to="/" className="block text-center text-sm text-zinc-500">
            ← Portfolio
          </Link>
        </form>
      </div>
    )
  }

  const p = content?.profile
  const crud = active !== 'profile' && active !== 'messages' ? CRUD_SECTIONS[active] : null

  return (
    <div className="min-h-screen admin-page">
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-white">Portfolio CMS</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-teal-400 text-sm">
              View site →
            </Link>
            <button
              type="button"
              className="text-red-400 text-sm"
              onClick={() => {
                localStorage.removeItem('token')
                setToken(null)
              }}
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto mt-3 flex gap-1 overflow-x-auto pb-1">
          {SECTION_NAV.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActive(key)
                setMsg('')
              }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                active === key ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setActive('messages')
              setMsg('')
            }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              active === 'messages' ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            Messages
          </button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {msg && <p className="text-teal-400 text-sm">{msg}</p>}

        {active === 'profile' && p && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-white font-semibold text-lg">Profile</h2>
            <p className="text-sm text-zinc-500">About, contact, and hero content — same fields as a LinkedIn profile header.</p>
            {(
              [
                ['full_name', 'Full name'],
                ['headline', 'Headline'],
                ['hero_tagline', 'Hero tagline'],
                ['location', 'Location'],
                ['email', 'Email'],
                ['website_url', 'Website'],
                ['linkedin_url', 'LinkedIn URL'],
                ['github_url', 'GitHub URL'],
                ['avatar_url', 'Avatar URL'],
                ['summary', 'About / Summary'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="text-zinc-500">{label}</span>
                {key === 'summary' ? (
                  <textarea
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 min-h-32"
                    value={p[key]}
                    onChange={(e) => setContent({ ...content!, profile: { ...p, [key]: e.target.value } })}
                  />
                ) : (
                  <input
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2"
                    value={p[key]}
                    onChange={(e) => setContent({ ...content!, profile: { ...p, [key]: e.target.value } })}
                  />
                )}
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-zinc-500">Optional 3D model URLs — line 1: Arduino (.dae/.glb), line 2: ESP32 (.glb). Defaults: Arduino Uno + ESP32-C6-MINI-1U.</span>
              <textarea
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 min-h-20 font-mono text-xs"
                value={(p.floating_images || []).join('\n')}
                onChange={(e) =>
                  setContent({
                    ...content!,
                    profile: { ...p, floating_images: e.target.value.split('\n').filter(Boolean) },
                  })
                }
              />
            </label>
            <button
              type="button"
              onClick={() => saveProfile(content!.profile).catch((e) => setMsg(e instanceof Error ? e.message : String(e)))}
              className="bg-teal-500 text-black font-semibold px-6 py-2 rounded-lg"
            >
              Save profile
            </button>
          </section>
        )}

        {active === 'messages' && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-white font-semibold text-lg">Contact messages</h2>
            <p className="text-sm text-zinc-500">Messages submitted from the portfolio contact form.</p>
            <ContactMessagesPanel />
          </section>
        )}

        {crud && (
          <CrudSection
            key={active}
            title={crud.title}
            apiPath={crud.apiPath}
            fields={crud.fields}
            emptyItem={crud.emptyItem}
            labelKey={crud.labelKey}
            onChange={load}
          />
        )}
      </main>
    </div>
  )
}
