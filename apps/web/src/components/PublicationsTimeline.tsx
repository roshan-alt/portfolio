import { motion } from 'framer-motion'
import type { Publication } from '../types'
import { externalRel, safeHttpUrl } from '../utils/safeUrl'

function preview(text: string, max = 160) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function sortByDate(items: Publication[]) {
  return [...items].sort((a, b) => {
    const da = a.publication_date?.trim() ?? ''
    const db = b.publication_date?.trim() ?? ''
    if (da && db) {
      const cmp = db.localeCompare(da)
      if (cmp !== 0) return cmp
    }
    return a.order - b.order
  })
}

function PublicationCard({ pub }: { pub: Publication }) {
  const pubUrl = safeHttpUrl(pub.url)
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-xl group-hover:text-teal-100 transition-colors">
            {pub.title}
          </h3>
          {pub.publisher && <p className="text-zinc-400 mt-1">{pub.publisher}</p>}
        </div>
        {pubUrl && (
          <span className="shrink-0 text-xs text-zinc-600 group-hover:text-teal-400 transition-colors mt-1">
            Read →
          </span>
        )}
      </div>

      {pub.description && (
        <p className="text-zinc-500 text-sm mt-3 leading-relaxed">{preview(pub.description)}</p>
      )}
    </>
  )

  const className =
    'group block rounded-2xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md p-6 hover:border-teal-500/40 hover:bg-[#0a0a0f]/65 transition-all'

  if (pubUrl) {
    return (
      <a href={pubUrl} target="_blank" rel={externalRel()} data-cursor="hover" className={className}>
        {inner}
      </a>
    )
  }

  return <article className={className}>{inner}</article>
}

export function PublicationsTimeline({ items }: { items: Publication[] }) {
  const sorted = sortByDate(items)

  return (
    <div className="relative">
      <div
        className="absolute left-[7px] md:left-[118px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-500/60 via-violet-500/20 to-transparent"
        aria-hidden
      />

      <ol className="space-y-0">
        {sorted.map((pub, i) => {
          const isLast = i === sorted.length - 1
          return (
            <motion.li
              key={pub.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07 }}
              className={`relative grid md:grid-cols-[100px_1fr] gap-4 md:gap-8 pl-8 md:pl-0 ${isLast ? '' : 'pb-10'}`}
            >
              <div className="absolute left-0 md:left-[112px] top-2 z-10">
                <motion.span
                  className="block w-4 h-4 rounded-full border-2 border-violet-400 bg-[#0a0a0f] shadow-[0_0_12px_rgba(167,139,250,0.45)]"
                  whileInView={{ scale: [0.6, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 + 0.1, duration: 0.35 }}
                />
              </div>

              <div className="md:text-right md:pt-1">
                <p className="text-violet-300/90 text-xs font-medium uppercase tracking-wider">
                  {pub.publication_date || '—'}
                </p>
              </div>

              <PublicationCard pub={pub} />
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
