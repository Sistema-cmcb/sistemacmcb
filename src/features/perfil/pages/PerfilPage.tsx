import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useSchool } from '@/features/escolas/contexts/SchoolContext'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  tesoureiro: 'Tesoureiro',
  fiscal: 'Fiscal',
  professor: 'Professor',
  comando: 'Comando (monitor militar)',
  responsavel: 'Responsável',
  aluno: 'Aluno',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export function PerfilPage() {
  const { profile, roles, isSuperAdmin } = useAuth()
  const { activeSchool } = useSchool()

  const rolesText =
    roles.length > 0
      ? roles.map((r) => roleLabels[r] ?? r).join(', ')
      : 'Nenhum papel atribuído'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <p className="text-muted-foreground">Dados da sua conta</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{profile?.name ?? 'Usuário'}</CardTitle>
          <CardDescription>{profile?.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Escola" value={activeSchool?.nome ?? '—'} />
          <Field label="Papéis" value={rolesText} />
          <Field
            label="Super admin da rede"
            value={isSuperAdmin ? 'Sim' : 'Não'}
          />
          <Field
            label="Status"
            value={profile?.active ? 'Ativo' : 'Inativo'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
