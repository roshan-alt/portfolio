import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import type { DisciplineSceneProps } from './DisciplineScene3D'

const DisciplineScene3D = lazy(() =>
  import('./DisciplineScene3D').then((m) => ({ default: m.DisciplineScene3D })),
)

const DISCIPLINES = [
  { label: 'Arduino', accent: 'text-teal-300' },
  { label: 'ESP32-C6', accent: 'text-amber-300' },
] as const

function DisciplineLabels({ progress }: { progress: MotionValue<number> }) {
  const smooth = useSpring(progress, { stiffness: 90, damping: 28, mass: 0.4 })

  const arduinoLabelOpacity = useTransform(smooth, [0, 0.35, 0.48], [1, 1, 0])
  const esp32LabelOpacity = useTransform(smooth, [0.42, 0.5, 0.92, 1], [0, 1, 1, 0])

  const opacities = [arduinoLabelOpacity, esp32LabelOpacity]

  return (
    <div className="absolute bottom-8 md:bottom-6 left-0 right-0 flex justify-center gap-10 md:gap-16 pointer-events-none z-[1]">
      {DISCIPLINES.map((d, i) => (
        <motion.span
          key={d.label}
          className={`text-xs md:text-sm uppercase tracking-[0.35em] font-medium ${d.accent} drop-shadow-lg`}
          style={{ opacity: opacities[i] }}
        >
          {d.label}
        </motion.span>
      ))}
    </div>
  )
}

function ScrollSceneBridge({
  progress,
  modelUrls,
}: {
  progress: MotionValue<number>
  modelUrls: string[]
}) {
  const scrollRef = useRef(progress.get())
  const [sceneReady, setSceneReady] = useState(false)

  useLayoutEffect(() => {
    scrollRef.current = progress.get()
  }, [progress])

  useMotionValueEvent(progress, 'change', (v) => {
    scrollRef.current = v
  })

  useEffect(() => {
    const start = () => setSceneReady(true)
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(start, { timeout: 1800 })
      return () => cancelIdleCallback(id)
    }
    const t = window.setTimeout(start, 400)
    return () => window.clearTimeout(t)
  }, [])

  if (!sceneReady) return null

  const sceneProps: DisciplineSceneProps = { scrollProgressRef: scrollRef, modelUrls }

  return (
    <SceneErrorBoundary>
      <Suspense fallback={null}>
        <DisciplineScene3D {...sceneProps} />
      </Suspense>
    </SceneErrorBoundary>
  )
}

export function SiteScrollBackground({ images }: { images: string[] }) {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26 })
  const progress = useTransform(smooth, [0, 0.92], [0, 1])
  const progressWidth = useTransform(smooth, [0, 0.92], ['0%', '100%'])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#14141f]" />
      <div className="absolute inset-0">
        <ScrollSceneBridge progress={progress} modelUrls={images} />
      </div>

      <div className="absolute inset-0 bg-[#0a0a0f]/28" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/40 via-[#0a0a0f]/8 to-[#0a0a0f]/55" />

      <DisciplineLabels progress={progress} />

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-[1]">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-amber-400"
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  )
}
