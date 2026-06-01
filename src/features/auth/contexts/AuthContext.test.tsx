import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { ReactNode } from 'react'

import { AuthProvider, useAuth } from './AuthContext'

// --- Mock do cliente Supabase (usado diretamente pelo contexto) ---
const getSessionMock = vi.fn()
const onAuthStateChangeMock = vi.fn()

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => getSessionMock(),
      onAuthStateChange: (cb: unknown) => onAuthStateChangeMock(cb),
    },
  },
}))

// --- Mock da camada de serviço de auth ---
const fetchProfileMock = vi.fn()
const fetchRolesMock = vi.fn()
const signInMock = vi.fn()
const signOutMock = vi.fn()

vi.mock('../services/auth.service', () => ({
  fetchProfile: (id: string) => fetchProfileMock(id),
  fetchRoles: (id: string) => fetchRolesMock(id),
  signInWithPassword: (email: string, password: string) =>
    signInMock(email, password),
  signOut: () => signOutMock(),
}))

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
  onAuthStateChangeMock.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

describe('AuthContext', () => {
  it('lança erro quando useAuth é usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrowError(
      /AuthProvider/,
    )
  })

  it('sem sessão, encerra o carregamento sem usuário', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.isSuperAdmin).toBe(false)
    expect(result.current.roles).toEqual([])
  })

  it('com sessão, carrega perfil e papéis do usuário', async () => {
    const session = { user: { id: 'user-1' } }
    getSessionMock.mockResolvedValue({ data: { session } })
    fetchProfileMock.mockResolvedValue({
      id: 'p1',
      user_id: 'user-1',
      name: 'Comandante Teste',
      email: 'cmd@cmcb.ma',
      escola_id: 'escola-1',
      is_super_admin: true,
      active: true,
      created_at: '',
      updated_at: '',
    })
    fetchRolesMock.mockResolvedValue(['admin'])

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() =>
      expect(result.current.profile?.name).toBe('Comandante Teste'),
    )
    expect(result.current.roles).toEqual(['admin'])
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isSuperAdmin).toBe(true)
    expect(result.current.hasRole('admin')).toBe(true)
    expect(result.current.hasRole('professor')).toBe(false)
  })

  it('signIn delega para a camada de serviço', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } })
    signInMock.mockResolvedValue({})

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signIn('a@b.com', 'secret123')
    })

    expect(signInMock).toHaveBeenCalledWith('a@b.com', 'secret123')
  })
})
