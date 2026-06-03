import { Link, useParams } from 'react-router-dom'
import { DateLine } from '../components/DateLine'
import { DetailLayout } from '../components/DetailLayout'
import { useContent } from '../hooks/useContent'

export function ExperienceDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading } = useContent()

  const item = data?.experience.find((e) => e.id === id)
  const others = data?.experience.filter((e) => e.id !== id) ?? []

  return (
    <DetailLayout loading={loading} notFound={!loading && !item}>
      {item && (
        <>
          <p className="text-teal-400 text-xs uppercase tracking-[0.25em] mb-3">Experience</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{item.title}</h1>
          <p className="text-xl text-zinc-400 mt-2">{item.company}</p>
          <DateLine
            start={item.start_date}
            end={item.end_date}
            extra={item.location}
            className="text-zinc-500 text-sm mt-4"
          />

          {item.description ? (
            <div className="mt-10 prose prose-invert max-w-none">
              <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>
          ) : (
            <p className="mt-10 text-zinc-600 text-sm">No description added yet.</p>
          )}

          {others.length > 0 && (
            <aside className="mt-16 pt-10 border-t border-white/10">
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">Other roles</h2>
              <ul className="space-y-3">
                {others.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={`/experience/${e.id}`}
                      className="block rounded-xl border border-white/10 px-4 py-3 hover:border-teal-500/30 transition-colors"
                      data-cursor="hover"
                    >
                      <span className="text-white font-medium">{e.title}</span>
                      <span className="text-zinc-500 text-sm"> · {e.company}</span>
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
