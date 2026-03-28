import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ResponseBubbleProps {
  content: string
  riskScore?: number
  wasFiltered?: boolean
  filterReason?: string | null
  modelUsed?: string
  nrlContext?: Record<string, unknown>
}

function riskColor(score: number): string {
  if (score < 40) return '#00FF9D'
  if (score <= 70) return '#FFB800'
  return '#FF3355'
}

export default function ResponseBubble({ content, riskScore, wasFiltered, filterReason, modelUsed, nrlContext }: ResponseBubbleProps) {
  const [showDetail, setShowDetail] = useState(false)
  const score = riskScore ?? 0
  const color = riskColor(score)

  return (
    <div className="max-w-[80%] group">
      <div className="bg-cyan/10 border border-cyan/20 rounded-xl p-4">
        {wasFiltered && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber/30 bg-amber/10 text-amber text-xs font-mono">
            ⚠ FILTERED
          </div>
        )}
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {typeof riskScore === 'number' && (
          <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, backgroundColor: color }}
            />
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          {typeof riskScore === 'number' && (
            <span className="text-xs font-mono" style={{ color }}>
              Risk: {score}
            </span>
          )}
          {(modelUsed || nrlContext || wasFiltered) && (
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="ml-auto text-white/30 hover:text-white/70 transition"
              aria-label="Toggle details"
            >
              <Info size={14} />
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <div className="mt-1 bg-[#0d1a2d] border border-white/10 rounded-lg p-3 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 uppercase tracking-widest text-[10px]">Query Details</span>
            <button onClick={() => setShowDetail(false)} className="text-white/30 hover:text-white/60">
              <X size={12} />
            </button>
          </div>
          {modelUsed && (
            <div className="flex gap-2">
              <span className="text-white/40">Model:</span>
              <span className="text-cyan">{modelUsed}</span>
            </div>
          )}
          {typeof riskScore === 'number' && (
            <div className="flex gap-2">
              <span className="text-white/40">Risk Score:</span>
              <span style={{ color }}>{score}/100</span>
            </div>
          )}
          {nrlContext && Object.keys(nrlContext).length > 0 && (
            <div>
              <span className="text-white/40 block mb-0.5">NRL Context:</span>
              <pre className={clsx('text-[10px] text-white/60 bg-white/5 rounded p-1.5 overflow-auto max-h-24')}>
                {JSON.stringify(nrlContext, null, 2)}
              </pre>
            </div>
          )}
          {wasFiltered && filterReason && (
            <div className="flex gap-2">
              <span className="text-white/40">Filter Reason:</span>
              <span className="text-amber">{filterReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
