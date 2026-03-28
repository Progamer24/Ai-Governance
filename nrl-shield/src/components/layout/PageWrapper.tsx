import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: ReactNode
  title: string
}

export default function PageWrapper({ children, title }: PageWrapperProps) {
  useEffect(() => {
    document.title = `${title} | NRL Shield`
  }, [title])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-6 py-6"
    >
      {children}
    </motion.div>
  )
}
