import { useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import NRLBadge from './NRLBadge'
import ChatWindow, { type Message } from './ChatWindow'
import QueryInput from './QueryInput'
import { useAIQuery } from '../../hooks/useAIQuery'
import { toast } from '../../components/ui/Toast'
import { useRealtime } from '../../hooks/useRealtime'

type RealtimeQuery = {
	id?: string
	created_at?: string
	query_text?: string
}

export default function AssistantPage(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
	const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const { sendQuery, isLoading } = useAIQuery()
	const { records: realtimeQueries, isSubscribed } = useRealtime<RealtimeQuery>('ai_queries')

  const handleSend = async (query: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: query }])
		try {
			const response = await sendQuery(query, selectedModel)
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
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Query failed or was blocked by security controls.')
		}
  }

  return (
    <PageWrapper title="AI Assistant">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-3">
          <NRLBadge />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-3 rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-white/70">
              Realtime Stream: <span className={isSubscribed ? 'text-green-300' : 'text-amber-300'}>{isSubscribed ? 'Connected' : 'Disconnected'}</span>
            </span>
            <span className="text-white/60">Observed Queries: {realtimeQueries.length}</span>
            {realtimeQueries[realtimeQueries.length - 1]?.query_text ? (
              <span className="max-w-[420px] truncate text-white/40">
                Latest: {realtimeQueries[realtimeQueries.length - 1]?.query_text}
              </span>
            ) : null}
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <QueryInput
				onSend={handleSend}
				isLoading={isLoading}
				selectedModel={selectedModel}
				onModelChange={setSelectedModel}
			/>
        </div>
      </div>
    </PageWrapper>
  )
}
