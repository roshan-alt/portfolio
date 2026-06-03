import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { parseApiError } from '../api'
import type { Profile } from '../types'
import { externalRel, safeHttpUrl, safeMailto } from '../utils/safeUrl'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type LinkItem = { label: string; href: string; external?: boolean }

function buildLinks(profile: Profile): LinkItem[] {
  const links: LinkItem[] = []
  const mailto = safeMailto(profile.email)
  if (mailto) links.push({ label: 'Email', href: mailto })
  const linkedin = safeHttpUrl(profile.linkedin_url)
  if (linkedin) links.push({ label: 'LinkedIn', href: linkedin, external: true })
  const github = safeHttpUrl(profile.github_url)
  if (github) links.push({ label: 'GitHub', href: github, external: true })
  const website = safeHttpUrl(profile.website_url)
  if (website) links.push({ label: 'Website', href: website, external: true })
  return links
}

export function ContactSection({ profile }: { profile: Profile }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const links = buildLinks(profile)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot.trim()) return
    setStatus('sending')
    setError('')
    try {
      const res = await fetch(`${API}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website: honeypot }),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      setStatus('sent')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors'

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <p className="text-teal-400 text-sm uppercase tracking-[0.25em] mb-3">Get in touch</p>
          <p className="text-zinc-400 leading-relaxed">
            {profile.headline
              ? `Interested in working together? Reach out about ${profile.headline.toLowerCase()} opportunities.`
              : 'Have a project in mind or want to connect? Send a message — I typically respond within a few days.'}
          </p>
        </div>

        {profile.location && (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-600 mb-1">Location</p>
            <p className="text-white">{profile.location}</p>
          </div>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? externalRel() : undefined}
                data-cursor="hover"
                className="px-4 py-2 rounded-full border border-white/10 bg-[#0a0a0f]/50 text-sm text-zinc-300 hover:border-teal-500/40 hover:text-teal-200 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md p-6 md:p-8 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-zinc-500 mb-1.5 block">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
              data-cursor="hover"
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 mb-1.5 block">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              data-cursor="hover"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-zinc-500 mb-1.5 block">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            placeholder="Project inquiry, collaboration…"
            data-cursor="hover"
          />
        </label>

        <label className="block">
          <span className="text-xs text-zinc-500 mb-1.5 block">Message</span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y min-h-[120px]`}
            placeholder="Tell me about your project or idea…"
            data-cursor="hover"
          />
        </label>

        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
        />

        {status === 'sent' && (
          <p className="text-teal-400 text-sm">Message sent — thank you! I&apos;ll get back to you soon.</p>
        )}
        {status === 'error' && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === 'sending'}
          data-cursor="hover"
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-teal-500 text-black font-semibold hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </motion.form>
    </div>
  )
}
