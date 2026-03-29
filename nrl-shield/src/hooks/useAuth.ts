import { useEffect } from 'react'
import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import * as authService from '../services/auth.service'
import type { AppUser } from '../types/auth.types'

interface AuthStore {
user: AppUser | null
session: Session | null
isLoading: boolean
isAuthenticated: boolean
login: (email: string, password: string) => Promise<void>
signup: (email: string, password: string, fullName: string, department: string) => Promise<void>
logout: () => Promise<void>
_setUser: (user: AppUser | null) => void
_setSession: (session: Session | null) => void
_setLoading: (loading: boolean) => void
}

const useAuthStore = create<AuthStore>((set) => ({
user: null,
session: null,
isLoading: true,
isAuthenticated: false,

login: async (email: string, password: string) => {
set({ isLoading: true })
try {
const user = await authService.login(email, password)
const session = await authService.getSession()
set({ user, session, isAuthenticated: true })
} finally {
set({ isLoading: false })
}
},

signup: async (email: string, password: string, fullName: string, department: string) => {
set({ isLoading: true })
try {
const authResult = await authService.signup({ email, password, fullName, department })
const session = await authService.getSession()
set({ user: authResult.user, session, isAuthenticated: true })
} finally {
set({ isLoading: false })
}
},

logout: async () => {
await authService.logout()
set({ user: null, session: null, isAuthenticated: false })
},

_setUser: (user) => set({ user, isAuthenticated: !!user }),
_setSession: (session) => set({ session }),
_setLoading: (isLoading) => set({ isLoading }),
}))

export function useAuth() {
const store = useAuthStore()

useEffect(() => {
let mounted = true

authService.getSession().then((session) => {
if (!mounted) return
store._setSession(session)
if (session?.user) {
authService.getCurrentUser().then((user) => {
if (!mounted) return
store._setUser(user)
store._setLoading(false)
})
} else {
store._setUser(null)
store._setLoading(false)
}
})

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
if (!mounted) return
store._setSession(session)
if (session?.user) {
authService.getCurrentUser().then((user) => {
if (!mounted) return
store._setUser(user)
})
} else {
store._setUser(null)
}
})

return () => {
mounted = false
subscription.unsubscribe()
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

return {
user: store.user,
session: store.session,
isLoading: store.isLoading,
isAuthenticated: store.isAuthenticated,
login: store.login,
signup: store.signup,
logout: store.logout,
}
}
