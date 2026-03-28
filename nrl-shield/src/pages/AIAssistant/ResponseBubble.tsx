import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { clsx } from 'clsx'
import Badge from '../../components/ui/Badge'

interface ResponseBubbleProps {
  role?: 'user' | 'assistant'
  content: string
  riskScore?: number
  wasFiltered?: boolean
  filterReason?: string | null
  modelUsed?: string
  tcsScore?: number
  trustTier?: 'ELEVATED' | 'HIGH' | 'STRICT'
  attestationVerified?: boolean
  receiptId?: string | null
  onViewReceipt?: (receiptId: string) => void
  nrlContext?: Record<string, unknown>
}

function riskColor(score: number): string {
  if (score < 40) return '#00FF9D'
  if (score <= 70) return '#FFB800'
  return '#FF3355'
}

export default function ResponseBubble({
  role = 'assistant',
  content,
  riskScore,
  wasFiltered,
  filterReason,
  modelUsed,
  tcsScore,
  trustTier,
  attestationVerified,
  receiptId,
  onViewReceipt,
  nrlContext,
}: ResponseBubbleProps): JSX.Element {
  const [showDetail, setShowDetail] = useState(false)
  const user = role === 'user'
  const score = riskScore ?? 0
  const color = riskColor(score)

  return (
    <div className={clsx('group flex', user ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] rounded-xl border p-4',
          user ? 'border-cyan/50 bg-cyan/15' : 'border-cyan/20 bg-cyan/10',
        )}
      >
        {wasFiltered && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber/30 bg-amber/10 text-amber text-xs font-mono">
            ⚠ FILTERED
          </div>
        )}
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

        {!user && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {typeof riskScore === 'number' ? <Badge variant={riskScore > 70 ? 'warning' : 'success'}>Risk {riskScore}</Badge> : null}
            {typeof tcsScore === 'number' ? <Badge>TCS {tcsScore}</Badge> : null}
            {trustTier ? <Badge>{trustTier}</Badge> : null}
            {attestationVerified != null ? <Badge variant={attestationVerified ? 'success' : 'warning'}>{attestationVerified ? 'Attested' : 'Unverified'}</Badge> : null}
            {modelUsed ? <Badge>{modelUsed}</Badge> : null}
            {wasFiltered ? <Badge variant="warning">Filtered</Badge> : null}
            {receiptId ? (
              <button
                type="button"
                onClick={() => onViewReceipt?.(receiptId)}
                className="rounded-md border border-cyan/40 px-2 py-0.5 text-cyan hover:border-cyan"
              >
                View Receipt
              </button>
            ) : null}
          </div>
        )}

        {!user && typeof riskScore === 'number' && (
          <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, backgroundColor: color }}
            />
          </div>
        )}

        {!user && (
          <div className="mt-2 flex items-center justify-between">
            {typeof riskScore === 'number' && (
              <span className="text-xs font-mono" style={{ color }}>
                Risk: {score}
              </span>
            )}
            {(modelUsed || nrlContext || wasFiltered || typeof tcsScore === 'number') && (
              <button
                onClick={() => setShowDetail((v) => !v)}
                className="ml-auto text-white/30 hover:text-white/70 transition"
                aria-label="Toggle details"
              >
                <Info size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {!user && showDetail && (
        <div className="mt-1 rounded-lg border border-white/10 bg-[#0d1a2d] p-3 text-xs font-mono space-y-1.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Query Details</span>
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
          {typeof tcsScore === 'number' && (
            <div className="flex gap-2">
              <span className="text-white/40">TCS Score:</span>
              <span className="text-cyan">{tcsScore}/100</span>
            </div>
          )}
          {typeof riskScore === 'number' && (
            <span className="text-xs font-mono" style={{ color }}>
              Risk: {score}/100
            </span>
          )}
          {trustTier && (
            <div className="flex gap-2">
              <span className="text-white/40">Trust Tier:</span>
              <span className="text-cyan">{trustTier}</span>
            </div>
          )}
          {attestationVerified != null && (
            <div className="flex gap-2">
              <span className="text-white/40">Attestation:</span>
              <span className={attestationVerified ? 'text-green-300' : 'text-amber-300'}>
                {attestationVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          )}
          {nrlContext && Object.keys(nrlContext).length > 0 && (
            <div>
              <span className="text-white/40 block mb-0.5">NRL Context:</span>
              <pre className={clsx('max-h-24 overflow-auto rounded bg-white/5 p-1.5 text-[10px] text-white/60')}>
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
