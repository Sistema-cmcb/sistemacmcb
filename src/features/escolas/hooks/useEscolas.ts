import { useQuery } from '@tanstack/react-query'

import { listEscolas } from '../services/escolas.service'

/**
 * Lista as escolas visíveis ao usuário autenticado (filtradas por RLS).
 * Habilitada apenas quando `enabled` for verdadeiro (ex.: super admin).
 */
export function useEscolas(enabled: boolean) {
  return useQuery({
    queryKey: ['escolas'],
    queryFn: listEscolas,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
