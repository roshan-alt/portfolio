import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project, Skill } from '../types'

type SortMode = 'alpha' | 'projects'

function projectsForSkill(skillName: string, projects: Project[]) {
  const needle = skillName.toLowerCase().trim()
  if (!needle) return []

  return projects.filter((p) => {
    if (p.tags?.some((t) => {
      const tag = t.toLowerCase()
      return tag === needle || tag.includes(needle) || needle.includes(tag)
    })) {
      return true
    }
    if (p.title.toLowerCase().includes(needle)) return true
    if (p.description.toLowerCase().includes(needle)) return true
    return false
  })
}

export function SkillsSection({ skills, projects }: { skills: Skill[]; projects: Project[] }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortMode>('alpha')

  const enriched = useMemo(
    () =>
      skills.map((s) => ({
        skill: s,
        linked: projectsForSkill(s.name, projects),
      })),
    [skills, projects],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? enriched.filter(({ skill }) => skill.name.toLowerCase().includes(q))
      : enriched

    list = [...list].sort((a, b) => {
      if (sort === 'projects') {
        return b.linked.length - a.linked.length || a.skill.name.localeCompare(b.skill.name)
      }
      return a.skill.name.localeCompare(b.skill.name)
    })
    return list
  }, [enriched, query, sort])

  const selected = filtered.find(({ skill }) => skill.id === selectedId) ?? enriched.find(({ skill }) => skill.id === selectedId)

  function toggleSkill(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search skills</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills…"
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
            data-cursor="hover"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </label>

        <div className="flex rounded-xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md p-1 shrink-0">
          {([
            ['alpha', 'A–Z'],
            ['projects', 'By projects'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                sort === mode
                  ? 'bg-teal-500/20 text-teal-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              data-cursor="hover"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-zinc-600 text-xs">
        {filtered.length} skill{filtered.length === 1 ? '' : 's'}
        {query ? ` matching “${query}”` : ''}
        {' · '}
        Click a skill to see related projects
      </p>

      <motion.div layout className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ skill, linked }, i) => {
            const isSelected = selectedId === skill.id
            return (
              <motion.button
                key={skill.id}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleSkill(skill.id)}
                data-cursor="hover"
                aria-pressed={isSelected}
                className={`group relative px-4 py-2 rounded-full text-sm border transition-all ${
                  isSelected
                    ? 'bg-teal-500/25 border-teal-400/60 text-teal-100 shadow-[0_0_20px_rgba(45,212,191,0.25)]'
                    : 'bg-[#0a0a0f]/50 backdrop-blur-md border-white/10 text-teal-200 hover:border-teal-500/40 hover:bg-teal-500/10'
                }`}
              >
                {skill.name}
                {linked.length > 0 && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-semibold ${
                      isSelected ? 'bg-teal-400/30 text-teal-100' : 'bg-white/10 text-zinc-400 group-hover:text-teal-300'
                    }`}
                  >
                    {linked.length}
                  </span>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-zinc-500 text-sm py-8 text-center">No skills match your search.</p>
      )}

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.skill.id}
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-teal-500/30 bg-[#0a0a0f]/60 backdrop-blur-md p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-xl">{selected.skill.name}</h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    {selected.linked.length > 0
                      ? `Used in ${selected.linked.length} project${selected.linked.length === 1 ? '' : 's'}`
                      : 'No linked projects yet — add matching tags on your projects in Admin'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-zinc-600 hover:text-zinc-300 text-xs shrink-0"
                  data-cursor="hover"
                >
                  Close ×
                </button>
              </div>

              {selected.linked.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {selected.linked.map((proj) => (
                    <li key={proj.id}>
                      <Link
                        to={`/projects/${proj.id}`}
                        data-cursor="hover"
                        className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-white font-medium group-hover:text-teal-100 transition-colors">
                            {proj.title}
                          </span>
                          {proj.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {proj.tags.slice(0, 4).map((t) => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-500">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600 group-hover:text-teal-400 shrink-0">View →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
