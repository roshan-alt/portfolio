import { motion } from 'framer-motion'
import { API_BASE } from '../api'

export function ContentLoading({ slow }: { slow?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <motion.div
        className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <p className="text-zinc-300 text-sm">{slow ? 'Waking up API (first load can take ~30s)…' : 'Loading portfolio…'}</p>
    </div>
  )
}

export function ContentError({ error }: { error: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const isLocalApi =
    API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center max-w-lg mx-auto">
      <p className="text-teal-400 text-lg font-semibold">Could not load portfolio</p>
      <p className="text-zinc-300 text-sm">{error}</p>

      {isLocalApi && (
        <p className="text-amber-200/90 text-xs leading-relaxed">
          This build is pointing at <code className="text-amber-100">{API_BASE}</code>. Set GitHub variable{' '}
          <strong>VITE_API_URL</strong> to your Render URL and redeploy.
        </p>
      )}

      <ul className="text-zinc-500 text-xs text-left space-y-1.5">
        <li>Render API must be running (visit {API_BASE}/health)</li>
        <li>
          On Render, set <code className="text-zinc-400">APP_ORIGINS</code> to include{' '}
          <code className="text-zinc-400">{origin}</code>
        </li>
        <li>Free tier cold start can take 30–60 seconds</li>
      </ul>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-2 rounded-full bg-teal-500 text-black font-semibold hover:bg-teal-400 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
