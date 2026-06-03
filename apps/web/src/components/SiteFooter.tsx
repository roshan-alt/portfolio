import { Link } from 'react-router-dom'

export function SiteFooter({ name }: { name?: string }) {
  const year = new Date().getFullYear()
  const holder = name?.trim() || 'Portfolio'

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0f]/60 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-zinc-500 text-sm">
          © {year} {holder}. All rights reserved.
        </p>
        <Link
          to="/admin"
          className="text-zinc-600 text-xs uppercase tracking-wider hover:text-teal-400 transition-colors"
          data-cursor="hover"
        >
          Admin
        </Link>
      </div>
    </footer>
  )
}
