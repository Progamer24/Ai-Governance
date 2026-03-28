import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import ResponseBubble from './ResponseBubble'

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  riskScore?: number
  wasFiltered?: boolean
  modelUsed?: string
  tcsScore?: number
  trustTier?: 'ELEVATED' | 'HIGH' | 'STRICT'
  attestationVerified?: boolean
  receiptId?: string | null
}

export type Message = ChatMessage

interface ChatWindowProps {
  messages: ChatMessage[]
  isLoading?: boolean
  onViewReceipt?: (receiptId: string) => void
}

export default function ChatWindow({ messages, isLoading = false, onViewReceipt }: ChatWindowProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
        <Bot size={40} className="text-white/20" strokeWidth={1.5} />
        <p className="text-white/40 text-sm">Ask a question to get started</p>
        <p className="text-white/20 text-xs max-w-xs">
          Your queries are filtered through NRL-aware security controls.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 rounded-xl border border-slate-700/80 bg-[#041024]/70">
      {messages.map((msg, i) => (
        <ResponseBubble
          key={msg.id ?? `${msg.role}-${i}`}
          role={msg.role}
          content={msg.content}
          riskScore={msg.riskScore}
          wasFiltered={msg.wasFiltered}
          modelUsed={msg.modelUsed}
          tcsScore={msg.tcsScore}
          trustTier={msg.trustTier}
          attestationVerified={msg.attestationVerified}
          receiptId={msg.receiptId}
          onViewReceipt={onViewReceipt}
        />
      ))}
      {isLoading ? <p className="text-xs text-cyan">Analyzing request through NRL pipeline...</p> : null}
      <div ref={bottomRef} />
    </div>
  )
}
