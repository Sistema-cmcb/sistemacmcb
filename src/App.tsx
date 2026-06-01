import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthPage } from '@/features/auth/pages/AuthPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { PerfilPage } from '@/features/perfil/pages/PerfilPage'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
