import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { partitionNavItems, type NavItem } from '../lib/buildPortfolioNav'

const SCROLL_THRESHOLD = 72

type Props = {
  /** Monogram initials, e.g. "RA" */
  brand: string
  items: NavItem[]
  contactHref?: string | null
}

function NavLink({
  item,
  active,
  onSelect,
}: {
  item: NavItem
  active: boolean
  onSelect: (id: string) => void
}) {
  return (
    <li className="relative flex items-center justify-center">
      {active && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-7 h-1 rounded-full bg-white
            shadow-[0_0_14px_rgba(255,255,255,0.85),0_0_28px_rgba(255,255,255,0.35)]
            pointer-events-none z-20"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        data-cursor="hover"
        aria-current={active ? 'page' : undefined}
        className={`relative z-10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${active ? 'bg-white/12 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'}`}
      >
        {item.label}
      </button>
    </li>
  )
}

export function ScrollNav({ brand, items, contactHref }: Props) {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<string>('top')
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const { main, more } = partitionNavItems(items)
  const observeIds = [...items.map((i) => i.id), 'contact']

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
      if (window.scrollY < SCROLL_THRESHOLD + 48) setActiveId('top')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
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

    observeIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [observeIds.join(',')])

  useEffect(() => {
    if (!moreOpen) return
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [moreOpen])

  const scrollTo = useCallback((id: string) => {
    setMoreOpen(false)
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const moreActive = more.some((m) => m.id === activeId)

  return (
    <motion.header
      role="navigation"
      aria-label="Site"
      aria-hidden={!visible}
      initial={false}
      animate={{ y: visible ? 0 : '-120%', opacity: visible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      className="fixed top-0 inset-x-0 z-40 pointer-events-none font-sans"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="flex items-center justify-between gap-4 md:gap-8 max-w-6xl mx-auto px-5 md:px-8 pt-5 md:pt-6">
        {/* Left — monogram / title */}
        <button
          type="button"
          onClick={() => scrollTo('top')}
          data-cursor="hover"
          aria-label="Back to top"
          className="shrink-0 text-xl md:text-2xl font-bold tracking-tighter text-white hover:text-teal-300 transition-colors"
        >
          {brand}
        </button>

        {/* Center — glass pill */}
        <div
          className="flex-1 flex justify-center min-w-0"
        >
          <div
            className="relative flex items-center gap-0.5 px-2 py-1.5 rounded-full
              bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-150
              border border-white/[0.12]
              shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]
              overflow-visible"
          >
            <ul className="flex items-center justify-center gap-0.5">
              {main.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  active={activeId === item.id}
                  onSelect={scrollTo}
                />
              ))}

              {more.length > 0 && (
                <li className="relative flex items-center">
                  <div ref={moreRef} className="relative flex items-center">
                  {moreActive && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-7 h-1 rounded-full bg-white
                        shadow-[0_0_14px_rgba(255,255,255,0.85)] pointer-events-none z-20"
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setMoreOpen((o) => !o)}
                    data-cursor="hover"
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                    className={`relative z-10 flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${moreActive ? 'bg-white/12 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'}`}
                  >
                    More
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={`opacity-70 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    >
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[10rem] py-1.5 rounded-2xl
                          bg-[#14141f]/95 backdrop-blur-xl border border-white/12 shadow-xl z-50"
                      >
                        {more.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollTo(item.id)}
                            data-cursor="hover"
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors
                              ${activeId === item.id ? 'text-teal-300 bg-white/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </li>
              )}
            </ul>

            <div className="w-px h-5 bg-white/10 mx-1 shrink-0" aria-hidden />

            <button
              type="button"
              onClick={() => scrollTo('contact')}
              data-cursor="hover"
              className="shrink-0 mx-1 px-4 py-2 rounded-xl text-sm font-medium text-white
                bg-white/[0.1] border border-white/[0.08] hover:bg-white/[0.16] transition-all"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Right — quick action */}
        <div className="shrink-0 w-9 md:w-10 flex justify-end">
          {contactHref ? (
            <a
              href={contactHref}
              data-cursor="hover"
              aria-label="Email"
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl text-zinc-400
                hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 6h16v12H4V6zm8 5.5L4.8 7.5h14.4L12 11.5zm0 1l8 5.5H4l8-5.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              data-cursor="hover"
              aria-label="Go to contact"
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl text-zinc-400
                hover:text-white hover:bg-white/5 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 6h16v12H4V6zm8 5.5L4.8 7.5h14.4L12 11.5zm0 1l8 5.5H4l8-5.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
