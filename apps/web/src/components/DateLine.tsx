export function DateLine({
  start,
  end,
  extra,
  endLabel,
  className = 'text-zinc-400 text-sm mt-1',
}: {
  start: string
  end?: string | null
  extra?: string
  endLabel?: string
  className?: string
}) {
  if (!start && !end && !extra) return null
  const range = start ? `${start} — ${end || 'Present'}` : end ? `${endLabel ?? 'Until'} ${end}` : ''
  return <p className={className}>{[range, extra].filter(Boolean).join(' · ')}</p>
}
