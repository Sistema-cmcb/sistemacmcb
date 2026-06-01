import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useEscolas } from '../hooks/useEscolas'
import type { Escola } from '../types'

interface SchoolContextValue {
  /** Escola atualmente ativa (contexto multi-tenant do frontend). */
  activeSchool: Escola | null
  /** Id da escola ativa — usado pelas queries dos módulos. */
  activeSchoolId: string | null
  /** Escolas disponíveis para troca (apenas super admin enxerga várias). */
  escolas: Escola[]
  /** Indica se o usuário pode alternar entre escolas. */
  canSwitch: boolean
  /** Define a escola ativa (somente super admin). */
  setActiveSchoolId: (id: string) => void
  loading: boolean
}

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined)

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { profile, isSuperAdmin } = useAuth()
  const escolasQuery = useEscolas(isSuperAdmin)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const escolas = useMemo<Escola[]>(
    () => escolasQuery.data ?? [],
    [escolasQuery.data],
  )

  // Para super admin: usa a escola escolhida ou, por padrão, a primeira.
  const activeSchoolId = isSuperAdmin
    ? (selectedId ?? escolas[0]?.id ?? null)
    : (profile?.escola_id ?? null)

  const activeSchool = useMemo<Escola | null>(() => {
    if (!activeSchoolId) return null
    return escolas.find((e) => e.id === activeSchoolId) ?? null
  }, [activeSchoolId, escolas])

  const value = useMemo<SchoolContextValue>(
    () => ({
      activeSchool,
      activeSchoolId,
      escolas,
      canSwitch: isSuperAdmin,
      setActiveSchoolId: setSelectedId,
      loading: isSuperAdmin ? escolasQuery.isLoading : false,
    }),
    [activeSchool, activeSchoolId, escolas, isSuperAdmin, escolasQuery.isLoading],
  )

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  )
}

export function useSchool(): SchoolContextValue {
  const context = useContext(SchoolContext)
  if (context === undefined) {
    throw new Error('useSchool deve ser usado dentro de um <SchoolProvider>')
  }
  return context
}
