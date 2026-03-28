import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import ResponseBubble from './ResponseBubble'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  riskScore?: number
  wasFiltered?: boolean
  modelUsed?: string
}

interface ChatWindowProps {
  messages: Message[]
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'user' ? (
            <div className="max-w-[75%] bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90">
              {msg.content}
            </div>
          ) : (
            <ResponseBubble
              content={msg.content}
              riskScore={msg.riskScore}
              wasFiltered={msg.wasFiltered}
              modelUsed={msg.modelUsed}
            />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
