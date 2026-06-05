import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '../contexts/AuthContext'
import {
  resetPasswordForEmail,
  signUp,
} from '../services/auth.service'

type Mode = 'login' | 'register' | 'forgot'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
})

const registerSchema = z
  .object({
    email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

const forgotSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>
type ForgotValues = z.infer<typeof forgotSchema>

interface LocationState {
  from?: { pathname: string }
}

export function AuthPage() {
  const { session, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/'

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  if (!loading && session) {
    return <Navigate to={redirectTo} replace />
  }

  function switchMode(next: Mode) {
    setMode(next)
    loginForm.reset()
    registerForm.reset()
    forgotForm.reset()
  }

  async function onLogin(values: LoginValues) {
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao autenticar'
      toast.error('Não foi possível entrar', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  async function onRegister(values: RegisterValues) {
    setSubmitting(true)
    try {
      await signUp(values.email, values.password)
      toast.success('Cadastro realizado!', {
        description:
          'Verifique seu e-mail para confirmar a conta antes de entrar.',
      })
      switchMode('login')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao criar conta'
      toast.error('Não foi possível criar a conta', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  async function onForgot(values: ForgotValues) {
    setSubmitting(true)
    try {
      await resetPasswordForEmail(values.email)
      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      })
      switchMode('login')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao enviar e-mail'
      toast.error('Não foi possível enviar o e-mail', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  const titles: Record<Mode, { title: string; description: string }> = {
    login: {
      title: 'Sistema CMCB',
      description: 'Gestão da rede de colégios militares do Maranhão',
    },
    register: {
      title: 'Criar conta',
      description: 'Preencha os dados para criar seu acesso',
    },
    forgot: {
      title: 'Recuperar senha',
      description: 'Informe seu e-mail para receber o link de redefinição',
    },
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">{titles[mode].title}</CardTitle>
          <CardDescription>{titles[mode].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === 'login' && (
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Senha</FormLabel>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                          Esqueci a senha
                        </button>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  Entrar
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              </form>
            </Form>
          )}

          {mode === 'register' && (
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  Criar conta
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Entrar
                  </button>
                </p>
              </form>
            </Form>
          )}

          {mode === 'forgot' && (
            <Form {...forgotForm}>
              <form
                onSubmit={forgotForm.handleSubmit(onForgot)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  Enviar link de recuperação
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Lembrou a senha?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </p>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
