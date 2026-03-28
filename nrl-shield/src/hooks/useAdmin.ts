import { useState } from 'react'

export function useAdmin() {
  const [isLoading] = useState(false)
  return { isLoading }
}
