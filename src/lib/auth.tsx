import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { backendConfigured, supabase } from './supabase'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}>({ user: null, loading: true, signOut: async () => {} })
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()
  useEffect(() => {
    let active = true
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setUser(data.session?.user ?? null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user.id
      const inactive = (q: { queryKey: readonly unknown[] }) =>
        q.queryKey[0] === 'user' && q.queryKey[1] !== nextId
      void queryClient.cancelQueries({ predicate: inactive })
      queryClient.removeQueries({ predicate: inactive })
      setUser(session?.user ?? null)
      setLoading(false)
    })
    if (!backendConfigured) setLoading(false)
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [queryClient])
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await queryClient.cancelQueries({
      predicate: (q) => q.queryKey[0] === 'user',
    })
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] === 'user' })
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
