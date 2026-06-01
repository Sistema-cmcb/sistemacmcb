import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchool } from '../contexts/SchoolContext'

/**
 * Seletor de escola exibido apenas para super admins, permitindo
 * alternar a escola ativa do contexto multi-tenant.
 */
export function SchoolSwitcher() {
  const { canSwitch, escolas, activeSchoolId, setActiveSchoolId } = useSchool()

  if (!canSwitch) return null

  return (
    <Select
      value={activeSchoolId ?? undefined}
      onValueChange={setActiveSchoolId}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Selecione uma escola" />
      </SelectTrigger>
      <SelectContent>
        {escolas.map((escola) => (
          <SelectItem key={escola.id} value={escola.id}>
            {escola.sigla ? `${escola.sigla} — ${escola.nome}` : escola.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
