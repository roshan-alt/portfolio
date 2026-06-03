import { Link, useParams } from 'react-router-dom'
import { DetailLayout } from '../components/DetailLayout'
import { useContent } from '../hooks/useContent'
import { externalRel, safeHttpUrl } from '../utils/safeUrl'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading } = useContent()

  const item = data?.projects.find((p) => p.id === id)
  const others = data?.projects.filter((p) => p.id !== id) ?? []
  const projectUrl = item ? safeHttpUrl(item.url) : null

  return (
    <DetailLayout loading={loading} notFound={!loading && !item}>
      {item && (
        <>
          {item.image_url && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mb-8 -mx-2 md:mx-0">
              <img src={item.image_url} alt="" className="w-full max-h-80 object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <p className="text-teal-400 text-xs uppercase tracking-[0.25em]">Project</p>
            {item.featured && (
              <span className="text-[10px] uppercase tracking-wider text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{item.title}</h1>

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {item.tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-200">
                  {t}
                </span>
              ))}
            </div>
          )}

          {item.description ? (
            <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap mt-8">{item.description}</p>
          ) : (
            <p className="mt-8 text-zinc-600 text-sm">No description added yet.</p>
          )}

          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel={externalRel()}
              className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-full bg-teal-500 text-black font-semibold hover:bg-teal-400 transition-colors"
              data-cursor="hover"
            >
              Visit project ↗
            </a>
          )}

          {others.length > 0 && (
            <aside className="mt-16 pt-10 border-t border-white/10">
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">More projects</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {others.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/projects/${p.id}`}
                      className="block rounded-xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-colors h-full"
                      data-cursor="hover"
                    >
                      {p.image_url && (
                        <img src={p.image_url} alt="" className="w-full h-24 object-cover" />
                      )}
                      <div className="p-4">
                        <span className="text-white font-medium text-sm">{p.title}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </>
      )}
    </DetailLayout>
  )
}
