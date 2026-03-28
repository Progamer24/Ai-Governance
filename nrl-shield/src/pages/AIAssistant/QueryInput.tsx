import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import Button from '../../components/ui/Button'
import PromptGuardBadge from '../../components/security/PromptGuardBadge'
import { quickCheck } from '../../services/promptGuard.service'

interface QueryInputProps {
  onSend: (query: string) => void
  isLoading: boolean
}

type GuardStatus = 'idle' | 'checking' | 'safe' | 'blocked'

export default function QueryInput({ onSend, isLoading }: QueryInputProps) {
  const [text, setText] = useState('')
  const [guardStatus, setGuardStatus] = useState<GuardStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!text.trim()) {
      setGuardStatus('idle')
      return
    }
    setGuardStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const blocked = quickCheck(text)
      setGuardStatus(blocked ? 'blocked' : 'safe')
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [text])

  const handleSend = () => {
    const q = text.trim()
    if (!q || isLoading || guardStatus === 'blocked') return
    onSend(q)
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
    <div className="border-t border-white/10 bg-navy/80 backdrop-blur p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant… (Shift+Enter for newline)"
            rows={3}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 focus:border-cyan rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none resize-none transition disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <PromptGuardBadge status={guardStatus} />
          <Button
            variant="primary"
            size="md"
            onClick={handleSend}
            disabled={isLoading || !text.trim() || guardStatus === 'blocked'}
            loading={isLoading}
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
