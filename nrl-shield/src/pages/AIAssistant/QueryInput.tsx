import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import Button from '../../components/ui/Button'
import PromptGuardBadge from '../../components/security/PromptGuardBadge'
import { quickCheck } from '../../services/promptGuard.service'

interface QueryInputProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => Promise<void> | void
  onSend?: (query: string) => void
  isLoading?: boolean
  disabled?: boolean
  guardBlocked?: boolean
}

type GuardStatus = 'idle' | 'checking' | 'safe' | 'blocked'

export default function QueryInput({
  value,
  onChange,
  onSubmit,
  onSend,
  isLoading = false,
  disabled = false,
  guardBlocked = false,
}: QueryInputProps): JSX.Element {
  const isControlled = typeof value === 'string' && typeof onChange === 'function'
  const [internalText, setInternalText] = useState('')
  const text = isControlled ? (value as string) : internalText

  const [guardStatus, setGuardStatus] = useState<GuardStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setText = (next: string) => {
    if (isControlled) {
      onChange?.(next)
      return
    }
    setInternalText(next)
  }

  const isBlocked = guardBlocked || guardStatus === 'blocked'

  const handleTextChange = (next: string) => {
    setText(next)

    if (!next.trim()) {
      setGuardStatus('idle')
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    setGuardStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const blocked = quickCheck(next)
      setGuardStatus(blocked ? 'blocked' : 'safe')
    }, 300)
  }

  useEffect(() => {
    // Cleanup pending guard checks when component unmounts.
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSend = async () => {
    const q = text.trim()
    const isBusy = isLoading || disabled
    if (!q || isBusy || isBlocked) return

    if (onSubmit) {
      await onSubmit()
    } else if (onSend) {
      onSend(q)
    }

    setText('')
    setGuardStatus('idle')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-white/10 bg-navy/80 p-4 backdrop-blur">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant... (Shift+Enter for newline)"
            rows={3}
            disabled={isLoading || disabled}
            className="w-full bg-white/5 border border-white/10 focus:border-cyan rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none resize-none transition disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <PromptGuardBadge status={guardStatus} blocked={isBlocked} />
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              void handleSend()
            }}
            disabled={isLoading || disabled || !text.trim() || isBlocked}
            loading={isLoading || disabled}
            className="flex items-center gap-2"
          >
            <Send size={14} />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
