# Sistema de Gestão CMCB

Sistema web **multi-tenant** para a rede de colégios militares do Maranhão
(CMCB). Várias escolas compartilham a mesma base de código e o mesmo banco de
dados, com isolamento por escola garantido via **Row Level Security (RLS)** no
Supabase.

> **Status:** Etapa 1 — Fundação (esqueleto + base multi-tenant). Os módulos de
> negócio (Financeiro, Matrícula, Acadêmico, Disciplinar, Comunicação) ainda
> **não** foram implementados.

## Stack

- **Vite + React 18 + TypeScript**
- **Supabase** (PostgreSQL + Auth + RLS) via `@supabase/supabase-js`
- **TanStack Query** para estado de servidor
- **shadcn/ui + Tailwind CSS** para a interface
- **React Router DOM v6**
- **React Hook Form + Zod** para formulários e validação
- **Recharts** (gráficos) e **date-fns** (datas)
- **Vitest + Testing Library** para testes

## Arquitetura

Organização **por feature**:

```
src/
  components/ui/         # componentes shadcn/ui
  integrations/supabase/ # client tipado + types gerados
  lib/                   # utilitários (cn, etc.)
  shared/components/     # ProtectedRoute, AppLayout
  test/                  # setup do Vitest
  features/
    auth/        { contexts, pages, services, types }
    escolas/     { contexts, components, hooks, services, types }
    dashboard/   { pages }
    perfil/      { pages }
    financeiro/  { pages, components, hooks, services }  # reservado
```

Convenções:

- **Camada de serviços:** toda chamada ao Supabase fica em `services/`; a UI
  consome via hooks do TanStack Query / contextos. Nunca acessar o Supabase
  direto nos componentes.
- **Tipagem forte:** zero `any`. Tipos do banco gerados em
  `src/integrations/supabase/types.ts`.
- **Multi-tenant:** tabelas de dados de escola têm `escola_id`; o isolamento é
  imposto por RLS no banco.
- **Alias `@/`** aponta para `src/`.

## Pré-requisitos

- Node.js 18+ (testado em Node 24)
- Conta e projeto no [Supabase](https://supabase.com)

## Setup

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Variáveis de ambiente**

   Copie o exemplo e preencha com as credenciais do seu projeto Supabase
   (Project Settings → API):

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<sua-anon-ou-publishable-key>
   ```

   > O arquivo `.env` está no `.gitignore` — **nunca** comite segredos.

3. **Rodar a migração no Supabase**

   Aplique `supabase/migrations/01_foundation_multitenant.sql` no banco. Opções:

   - **SQL Editor** do painel do Supabase: cole e execute o conteúdo do arquivo; ou
   - **Supabase CLI:** `supabase db push` (com o projeto vinculado); ou
   - **MCP do Supabase** (em ferramentas compatíveis): `apply_migration`.

   A migração cria as tabelas `escolas`, `profiles` e `user_roles`, o enum
   `app_role`, as funções de apoio (`is_admin`, `is_super_admin`,
   `user_school_id`, etc.), os triggers e as **políticas de RLS**.

4. **Rodar em desenvolvimento**

   ```bash
   npm run dev
   ```

## Scripts

| Script              | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento (Vite)         |
| `npm run build`     | Type-check + build de produção             |
| `npm run preview`   | Pré-visualização do build                  |
| `npm run lint`      | ESLint                                     |
| `npm run test`      | Testes (Vitest, modo run)                  |
| `npm run test:watch`| Testes em modo watch                       |
| `npm run typecheck` | Verificação de tipos sem emitir            |

## Criando o primeiro usuário / escola

Como o cadastro é restrito (sem signup público nesta etapa):

1. Crie uma escola na tabela `public.escolas` (SQL Editor).
2. Crie um usuário em **Authentication → Users** (o trigger `handle_new_user`
   cria automaticamente o `profile`).
3. Atualize esse `profile`: defina `escola_id` e, se for coordenador da rede,
   `is_super_admin = true`.
4. (Opcional) Atribua papéis inserindo em `public.user_roles`
   (ex.: `('<user_id>', 'admin')`).

## Autenticação e papéis

Papéis (`app_role`): `admin`, `secretaria`, `tesoureiro`, `fiscal`,
`professor`, `comando`, `responsavel`, `aluno`. Além disso, o perfil tem
`is_super_admin` para quem coordena toda a rede e enxerga todas as escolas.

Rotas protegidas usam `ProtectedRoute` (props `adminOnly` e `allowedRoles`).
Super admins veem o seletor de escola no topo (`SchoolSwitcher`).
