import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { ArrowRight, Leaf } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ErrorState, Loading } from '../components/states'
import { useAuth } from '../lib/auth'
import { backendConfigured, supabase } from '../lib/supabase'

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
        setError(result.error.message)
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
        <h1>Make yourself at home.</h1>
        <p>You're signed in as {auth.user.email}.</p>
        <Button asChild>
          <Link to={redirect}>
            Continue
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
          Sign out
        </Button>
        {error && <ErrorState message={error} />}
      </div>
    )
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <Leaf size={45} strokeWidth={1} />
        <h2>
          A place for
          <br />
          your favorites.
        </h2>
        <p>
          Keep your bag close, revisit your orders,
          <br />
          and make room for a little everyday joy.
        </p>
        <span>Good things, wherever you are.</span>
      </div>
      <div className="auth-form">
        <p className="section-kicker">Welcome to Everyday Edit</p>
        <h1>
          {mode === 'signin' ? 'Good to see you.' : 'Make yourself at home.'}
        </h1>
        <p>
          {mode === 'signin'
            ? 'Sign in to pick up where you left off.'
            : 'A few details, and you’re part of the everyday.'}
        </p>
        <div className="auth-tabs" role="group" aria-label="Account action">
          <button
            aria-pressed={mode === 'signin'}
            onClick={() => {
              setMode('signin')
              setError('')
            }}
          >
            Sign in
          </button>
          <button
            aria-pressed={mode === 'signup'}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            Create account
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
                    {name === 'email' ? 'Email address' : 'Password'}
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
                  {name === 'password' && <small>At least 8 characters.</small>}
                  <span
                    id={`${name}-error`}
                    className="field-error"
                    aria-live="polite"
                  >
                    {field.state.meta.errors
                      .map((e) => (typeof e === 'string' ? e : e?.message))
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
                  ? 'One moment…'
                  : mode === 'signin'
                    ? 'Sign in'
                    : 'Create your account'}
                <ArrowRight size={17} />
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="auth-note">
          Demo accounts use real local authentication.
          <br />
          No real payments. No marketing emails.
        </p>
      </div>
    </div>
  )
}
