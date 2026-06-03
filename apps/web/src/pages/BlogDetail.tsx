import { Link, useParams } from 'react-router-dom'
import { DetailLayout } from '../components/DetailLayout'
import { useContent } from '../hooks/useContent'

export function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading } = useContent()

  const post = data?.blog_posts.find((b) => b.id === id)
  const others = data?.blog_posts.filter((b) => b.id !== id) ?? []

  return (
    <DetailLayout loading={loading} notFound={!loading && !post}>
      {post && (
        <>
          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mb-8 -mx-2 md:mx-0">
              <img src={post.cover_image_url} alt="" className="w-full max-h-96 object-cover" />
            </div>
          )}

          <p className="text-teal-400 text-xs uppercase tracking-[0.25em]">Blog</p>

          {post.published_date && (
            <time className="block text-zinc-400 text-sm mt-3">{post.published_date}</time>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mt-4">{post.title}</h1>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {post.body ? (
            <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap mt-10">{post.body}</div>
          ) : (
            <p className="mt-10 text-zinc-500 text-sm">No content yet.</p>
          )}

          {others.length > 0 && (
            <aside className="mt-16 pt-10 border-t border-white/10">
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">More posts</h2>
              <ul className="space-y-3">
                {others.slice(0, 4).map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/blog/${b.id}`}
                      className="block rounded-xl border border-white/10 p-4 hover:border-teal-500/30 transition-colors"
                      data-cursor="hover"
                    >
                      <span className="text-white font-medium group-hover:text-teal-100">{b.title}</span>
                      {b.published_date && (
                        <span className="text-zinc-500 text-xs ml-2">· {b.published_date}</span>
                      )}
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
