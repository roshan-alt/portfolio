import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { BlogPost } from '../types'

function preview(text: string, max = 160) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function sortPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const da = a.published_date?.trim() ?? ''
    const db = b.published_date?.trim() ?? ''
    if (da && db) {
      const cmp = db.localeCompare(da)
      if (cmp !== 0) return cmp
    }
    return a.order - b.order
  })
}

export function BlogPostsList({ posts }: { posts: BlogPost[] }) {
  const sorted = sortPosts(posts)

  return (
    <div className="space-y-6">
      {sorted.map((post, i) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
        >
          <Link
            to={`/blog/${post.id}`}
            data-cursor="hover"
            className="group grid md:grid-cols-[1fr_200px] gap-6 rounded-2xl border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md overflow-hidden hover:border-teal-500/40 transition-all hover:-translate-y-0.5"
          >
            <div className="p-6 md:p-8 flex flex-col justify-center order-2 md:order-1">
              {post.published_date && (
                <time className="text-teal-400/90 text-xs font-medium uppercase tracking-wider">
                  {post.published_date}
                </time>
              )}
              <h3 className="text-white font-semibold text-xl md:text-2xl mt-2 group-hover:text-teal-100 transition-colors">
                {post.title}
              </h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed line-clamp-3">
                {post.excerpt?.trim() || preview(post.body)}
              </p>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs text-zinc-500 group-hover:text-teal-400 mt-4 transition-colors">
                Read post →
              </span>
            </div>
            {post.cover_image_url && (
              <div className="order-1 md:order-2 min-h-[180px] md:min-h-0">
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="w-full h-full min-h-[180px] object-cover"
                />
              </div>
            )}
          </Link>
        </motion.article>
      ))}
    </div>
  )
}
