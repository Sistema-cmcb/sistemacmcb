import { supabase } from '@/integrations/supabase/client'
import type { Escola } from '../types'

/**
 * Camada de serviço de escolas.
 * As políticas de RLS garantem que cada usuário só enxergue as escolas
 * permitidas (a própria, ou todas no caso de super admin).
 */

export async function listEscolas(): Promise<Escola[]> {
  const { data, error } = await supabase
    .from('escolas')
    .select('*')
    .order('nome', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getEscola(id: string): Promise<Escola | null> {
  const { data, error } = await supabase
    .from('escolas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
