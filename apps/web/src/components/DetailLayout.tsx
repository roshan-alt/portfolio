import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CustomCursor } from './CustomCursor'

export function DetailLayout({
  children,
  loading,
  notFound,
  backLabel = '← Back to portfolio',
}: {
  children: React.ReactNode
  loading?: boolean
  notFound?: boolean
  backLabel?: string
}) {
  if (loading) {
    return (
      <>
        <CustomCursor />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <CustomCursor />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-zinc-400">This page could not be found.</p>
          <Link to="/" className="text-teal-400 hover:text-teal-300" data-cursor="hover">
            {backLabel}
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/5">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <Link
              to="/"
              className="text-sm text-zinc-500 hover:text-teal-400 transition-colors inline-flex items-center gap-2"
              data-cursor="hover"
            >
              {backLabel}
            </Link>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto px-6 py-12 pb-24"
        >
          {children}
        </motion.main>
      </div>
    </>
  )
}
