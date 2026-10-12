import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { ArrowRight, Leaf } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ErrorState, Loading } from '../components/states'
import { useAuth } from '../lib/auth'
import { translateMessage } from '../lib/i18n'
import { backendConfigured, supabase } from '../lib/supabase'

function authErrorMessage(error: {
  code?: string
  message: string
  status?: number
}) {
  const messages: Record<string, string> = {
    invalid_credentials: 'Invalid login credentials',
    user_already_exists: 'User already registered',
    email_exists: 'User already registered',
    email_not_confirmed: 'Email not confirmed',
    weak_password: 'Password does not meet the security requirements.',
    validation_failed: 'Enter a valid email address.',
    over_request_rate_limit: 'Too many requests. Please try again later.',
    over_email_send_rate_limit: 'Too many requests. Please try again later.',
  }
  if (error.status === 429) return 'Too many requests. Please try again later.'
  if (/fetch|network|connection/i.test(error.message))
    return 'Unable to connect. Please check your connection and try again.'
  return messages[error.code ?? ''] || error.message
}

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
})
export const Route = createFileRoute('/auth')({
  validateSearch: (s) => ({
    redirect:
      s.redirect === '/checkout'
        ? ('/checkout' as const)
        : ('/orders' as const),
  }),
  component: Auth,
})
function Auth() {
  const { t } = useTranslation()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const auth = useAuth()
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setError('')
      if (!backendConfigured) {
        setError(
          'Connect the local Supabase backend first. See the project README for setup.',
        )
        return
      }
      const result =
        mode === 'signup'
          ? await supabase.auth.signUp(value)
          : await supabase.auth.signInWithPassword(value)
      if (result.error) {
        setError(authErrorMessage(result.error))
        return
      }
      if (!result.data.session) {
        setError(
          'Email confirmation is enabled. Disable Confirm email in Supabase for this demo, then sign in.',
        )
        return
      }
      await navigate({ to: redirect })
    },
  })
  if (auth.loading) return <Loading />
  if (auth.user)
    return (
      <div className="wrap section account-panel">
        <Leaf size={35} />
        <h1>{t('Make yourself at home.')}</h1>
        <p>{t("You're signed in as {{email}}.", { email: auth.user.email })}</p>
        <Button asChild>
          <Link to={redirect}>
            {t('Continue')}
            <ArrowRight size={16} />
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void auth
              .signOut()
              .catch(() => setError('Sign out failed. Please retry.'))
          }
        >
          {t('Sign out')}
        </Button>
        {error && <ErrorState message={error} />}
      </div>
    )
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <Leaf size={45} strokeWidth={1} />
        <h2>
          {t('A place for')}
          <br />
          {t('your favorites.')}
        </h2>
        <p>
          {t('Keep your bag close, revisit your orders,')}
          <br />
          {t('and make room for a little everyday joy.')}
        </p>
        <span>{t('Good things, wherever you are.')}</span>
      </div>
      <div className="auth-form">
        <p className="section-kicker">{t('Welcome to Daykind')}</p>
        <h1>
          {mode === 'signin'
            ? t('Good to see you.')
            : t('Make yourself at home.')}
        </h1>
        <p>
          {mode === 'signin'
            ? t('Sign in to pick up where you left off.')
            : t('A few details, and you’re part of the everyday.')}
        </p>
        <div
          className="auth-tabs"
          role="group"
          aria-label={t('Account action')}
        >
          <button
            aria-pressed={mode === 'signin'}
            onClick={() => {
              setMode('signin')
              setError('')
            }}
          >
            {t('Sign in')}
          </button>
          <button
            aria-pressed={mode === 'signup'}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            {t('Create account')}
          </button>
        </div>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit().then(() => {
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLInputElement>(
                    '#main [aria-invalid="true"]',
                  )
                  ?.focus(),
              )
            })
          }}
        >
          {(['email', 'password'] as const).map((name) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="form-field">
                  <label htmlFor={name}>
                    {name === 'email' ? t('Email address') : t('Password')}
                  </label>
                  <Input
                    id={name}
                    name={name}
                    spellCheck={false}
                    type={name === 'password' ? 'password' : 'email'}
                    autoComplete={
                      name === 'email'
                        ? 'email'
                        : mode === 'signin'
                          ? 'current-password'
                          : 'new-password'
                    }
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!field.state.meta.errors.length}
                    aria-describedby={`${name}-error`}
                  />
                  {name === 'password' && (
                    <small>{t('At least 8 characters.')}</small>
                  )}
                  <span
                    id={`${name}-error`}
                    className="field-error"
                    aria-live="polite"
                  >
                    {field.state.meta.errors
                      .map((e) =>
                        translateMessage(
                          typeof e === 'string' ? e : e?.message,
                        ),
                      )
                      .join(' ')}
                  </span>
                </div>
              )}
            </form.Field>
          ))}
          {error && <ErrorState message={error} />}
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(pending) => (
              <Button
                size="lg"
                className="full-width"
                type="submit"
                disabled={pending}
              >
                {pending
                  ? t('One moment…')
                  : mode === 'signin'
                    ? t('Sign in')
                    : t('Create your account')}
                <ArrowRight size={17} />
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="auth-note">
          {t('Demo accounts use real local authentication.')}
          <br />
          {t('No real payments. No marketing emails.')}
        </p>
      </div>
    </div>
  )
}
