import { useNRL } from '../../hooks/useNRL'

export default function NRLBadge() {
  const { level, needTags, isLoading, nrlProfile } = useNRL()

  if (isLoading) {
    return (
      <div className="bg-cyan/5 border border-cyan/20 rounded-lg px-4 py-2 text-xs font-mono text-white/40">
        NRL CONTEXT: LOADING...
      </div>
    )
  }

  if (!nrlProfile) {
    return (
      <div className="bg-amber/5 border border-amber/20 rounded-lg px-4 py-2 text-xs font-mono text-amber">
        NRL CONTEXT: NOT ASSIGNED
      </div>
    )
  }

  const tags = needTags.length > 0 ? needTags.join(' | ') : 'NO TAGS'

  return (
    <div className="bg-cyan/5 border border-cyan/20 rounded-lg px-4 py-2 text-xs font-mono text-cyan">
      LEVEL {level} | {tags}
    </div>
  )
}
