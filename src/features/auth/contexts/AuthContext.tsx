import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '@/integrations/supabase/client'
import {
  fetchProfile,
  fetchRoles,
  signInWithPassword,
  signOut as signOutService,
} from '../services/auth.service'
import type { AppRole, Profile } from '../types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  roles: AppRole[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: AppRole) => boolean
  isAdmin: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<AppRole[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (userId: string) => {
    const [profileData, rolesData] = await Promise.all([
      fetchProfile(userId),
      fetchRoles(userId),
    ])
    setProfile(profileData)
    setRoles(rolesData)
  }, [])

  useEffect(() => {
    let active = true

    // Assina mudanças de sessão. O carregamento de perfil/roles é adiado
    // para fora do callback para evitar deadlocks do cliente Supabase.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (nextSession?.user) {
        setTimeout(() => {
          if (active) void loadUserData(nextSession.user.id)
        }, 0)
      } else {
        setProfile(null)
        setRoles([])
      }
    })

    // Sessão inicial.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        void loadUserData(data.session.user.id).finally(() => {
          if (active) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadUserData])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithPassword(email, password)
  }, [])

  const signOut = useCallback(async () => {
    await signOutService()
    setProfile(null)
    setRoles([])
    setSession(null)
  }, [])

  const hasRole = useCallback(
    (role: AppRole) => roles.includes(role),
    [roles],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      roles,
      loading,
      signIn,
      signOut,
      hasRole,
      isAdmin: roles.includes('admin'),
      isSuperAdmin: profile?.is_super_admin ?? false,
    }),
    [session, profile, roles, loading, signIn, signOut, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>')
  }
  return context
}
