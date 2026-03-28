import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import NRLBadge from './NRLBadge'
import ChatWindow, { type Message } from './ChatWindow'
import QueryInput from './QueryInput'
import { useAIQuery } from '../../hooks/useAIQuery'
import { toast } from '../../components/ui/Toast'

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const { sendQuery, isLoading } = useAIQuery()

  const handleSend = async (query: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    const response = await sendQuery(query)
    if (response) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          riskScore: response.riskScore,
          wasFiltered: response.wasFiltered,
          modelUsed: response.modelUsed,
        },
      ])
    } else {
      toast.error('Query failed or was blocked by security controls.')
    }
  }

  return (
    <PageWrapper title="AI Assistant">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-3">
          <NRLBadge />
        </div>
        <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <ChatWindow messages={messages} />
          <QueryInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </PageWrapper>
  )
}
