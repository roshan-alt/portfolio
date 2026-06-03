import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { NavItem } from '../lib/buildPortfolioNav'

const SCROLL_THRESHOLD = 72

type Props = {
  brand: string
  items: NavItem[]
}

export function ScrollNav({ brand, items }: Props) {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = items.map((i) => i.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = inView[0]?.target.id
        if (top) setActiveId(top)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const scrollTo = useCallback((id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <motion.nav
      role="navigation"
      aria-label="Page sections"
      aria-hidden={!visible}
      initial={false}
      animate={{
        y: visible ? 0 : '-110%',
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      className="fixed top-0 inset-x-0 z-40 pointer-events-none"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="mx-3 mt-3 md:mx-auto md:max-w-5xl">
        <div
          className="flex items-center gap-3 px-4 py-2.5 md:px-5 md:py-3 rounded-2xl
            bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150
            border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.45)]
            ring-1 ring-inset ring-white/5"
        >
          <button
            type="button"
            onClick={() => scrollTo('top')}
            data-cursor="hover"
            className="shrink-0 text-sm font-bold text-white tracking-tight hover:text-teal-300 transition-colors"
          >
            {brand}
          </button>

          <div className="h-5 w-px bg-white/15 shrink-0 hidden sm:block" aria-hidden />

          <ul className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0 py-0.5 -my-0.5">
            {items.map((item) => {
              const active = activeId === item.id
              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    data-cursor="hover"
                    aria-current={active ? 'true' : undefined}
                    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] transition-all whitespace-nowrap
                      ${active
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </motion.nav>
  )
}
