import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'
import type { AppRole } from '@/features/auth/types'

// Estado de auth controlável por teste.
interface FakeAuth {
  session: unknown
  loading: boolean
  roles: AppRole[]
  isAdmin: boolean
  isSuperAdmin: boolean
}

let authState: FakeAuth

vi.mock('@/features/auth/contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

function renderAt(
  initialPath: string,
  element: React.ReactNode,
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div>Tela de login</div>} />
        <Route path="/" element={<div>Home pública</div>} />
        <Route path="/admin" element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  authState = {
    session: null,
    loading: false,
    roles: [],
    isAdmin: false,
    isSuperAdmin: false,
  }
})

describe('ProtectedRoute', () => {
  it('redireciona para /auth quando não há sessão', () => {
    authState.session = null
    renderAt(
      '/admin',
      <ProtectedRoute>
        <div>Conteúdo protegido</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('libera o conteúdo quando há sessão', () => {
    authState.session = { user: { id: 'u1' } }
    renderAt(
      '/admin',
      <ProtectedRoute>
        <div>Conteúdo protegido</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })

  it('bloqueia adminOnly para não-admin (redireciona para /)', () => {
    authState.session = { user: { id: 'u1' } }
    authState.isAdmin = false
    renderAt(
      '/admin',
      <ProtectedRoute adminOnly>
        <div>Área administrativa</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Home pública')).toBeInTheDocument()
    expect(screen.queryByText('Área administrativa')).not.toBeInTheDocument()
  })

  it('permite adminOnly para admin', () => {
    authState.session = { user: { id: 'u1' } }
    authState.isAdmin = true
    renderAt(
      '/admin',
      <ProtectedRoute adminOnly>
        <div>Área administrativa</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Área administrativa')).toBeInTheDocument()
  })

  it('aplica allowedRoles corretamente', () => {
    authState.session = { user: { id: 'u1' } }
    authState.roles = ['professor']
    renderAt(
      '/admin',
      <ProtectedRoute allowedRoles={['tesoureiro']}>
        <div>Somente tesouraria</div>
      </ProtectedRoute>,
    )
    expect(screen.getByText('Home pública')).toBeInTheDocument()
    expect(screen.queryByText('Somente tesouraria')).not.toBeInTheDocument()
  })
})
