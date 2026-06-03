import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  parallax?: number
}

/** Section content shifts subtly with page scroll */
export function ScrollSection({ children, className = '', parallax = 40 }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const y = useTransform(smooth, [0, 1], [parallax, -parallax])
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6])

  return (
    <motion.section ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.section>
  )
}

export function Section({
  title,
  children,
  index = 0,
  id,
}: {
  title: string
  children: ReactNode
  index?: number
  id?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28 })
  const titleX = useTransform(smooth, [0, 1], [index % 2 === 0 ? -30 : 30, 0])
  const titleOpacity = useTransform(smooth, [0, 0.4, 1], [0, 1, 1])

  return (
    <ScrollSection className={id ? 'scroll-mt-28' : 'scroll-mt-8'}>
      <motion.section
        id={id}
        ref={ref}
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h2
          className="text-3xl font-bold text-white mb-8 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          style={{ x: titleX, opacity: titleOpacity }}
        >
          {title}
        </motion.h2>
        {children}
      </motion.section>
    </ScrollSection>
  )
}
