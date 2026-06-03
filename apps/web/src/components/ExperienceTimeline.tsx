import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Experience } from '../types'
import { DateLine } from './DateLine'

function preview(text: string, max = 140) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  return (
    <div className="relative">
      {/* vertical spine */}
      <div
        className="absolute left-[7px] md:left-[118px] top-3 bottom-3 w-px bg-gradient-to-b from-teal-500/60 via-teal-500/20 to-transparent"
        aria-hidden
      />

      <ol className="space-y-0">
        {items.map((e, i) => {
          const isLast = i === items.length - 1
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07 }}
              className={`relative grid md:grid-cols-[100px_1fr] gap-4 md:gap-8 pl-8 md:pl-0 ${isLast ? '' : 'pb-10'}`}
            >
              {/* node */}
              <div className="absolute left-0 md:left-[112px] top-2 z-10">
                <motion.span
                  className="block w-4 h-4 rounded-full border-2 border-teal-400 bg-[#0a0a0f] shadow-[0_0_12px_rgba(45,212,191,0.45)]"
                  whileInView={{ scale: [0.6, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 + 0.1, duration: 0.35 }}
                />
              </div>

              {/* date column */}
              <div className="md:text-right md:pt-1">
                <p className="text-teal-400/90 text-xs font-medium uppercase tracking-wider">
                  {e.end_date ? e.end_date : 'Present'}
                </p>
                {e.start_date && (
                  <p className="text-zinc-600 text-xs mt-0.5">{e.start_date}</p>
                )}
              </div>

              {/* card */}
              <Link
                to={`/experience/${e.id}`}
                data-cursor="hover"
                className="group block rounded-2xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md p-6 hover:border-teal-500/40 hover:bg-[#0a0a0f]/65 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-semibold text-xl group-hover:text-teal-100 transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-zinc-400 mt-1">{e.company}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-600 group-hover:text-teal-400 transition-colors mt-1">
                    Details →
                  </span>
                </div>

                <DateLine start={e.start_date} end={e.end_date} extra={e.location} className="text-zinc-600 text-sm mt-2" />

                {e.description && (
                  <p className="text-zinc-500 text-sm mt-3 leading-relaxed">{preview(e.description)}</p>
                )}
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
