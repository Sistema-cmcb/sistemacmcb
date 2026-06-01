import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useSchool } from '@/features/escolas/contexts/SchoolContext'

export function DashboardPage() {
  const { profile } = useAuth()
  const { activeSchool } = useSchool()

  const escolaLabel = activeSchool?.nome ?? 'nenhuma escola selecionada'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {profile?.name ?? 'usuário'} — {escolaLabel}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fundação concluída</CardTitle>
          <CardDescription>
            Esqueleto multi-tenant pronto. Os módulos de negócio serão
            adicionados nas próximas etapas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Financeiro, Matrícula, Acadêmico, Disciplinar e Comunicação.
        </CardContent>
      </Card>
    </div>
  )
}
