import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'

import { ArrowLeft, ArrowRight, FlaskConical, LockKeyhole } from 'lucide-react'
import { BagLine, Summary } from '../components/bag'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Empty, ErrorState, Loading } from '../components/states'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import {
  addressSchema,
  CheckoutError,
  readAttempt,
  saveAttempt,
  sendCheckout,
} from '../lib/checkout'
import type { CheckoutAttempt } from '../lib/checkout'

const labels = {
  name: 'Full name',
  email: 'Email address',
  address: 'Street address',
  city: 'City',
  state: 'State',
  zip: 'ZIP code',
}
const completions = {
  name: 'name',
  email: 'email',
  address: 'street-address',
  city: 'address-level2',
  state: 'address-level1',
  zip: 'postal-code',
}
export const Route = createFileRoute('/checkout')({ component: Checkout })
function Checkout() {
  const auth = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [payment, setPayment] = useState<'succeeded' | 'failed'>('succeeded')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(readAttempt)
  const [processing, setProcessing] = useState(false)
  const activeAttempt = attempt?.userId === auth.user?.id ? attempt : null
  async function completeAttempt(pending: CheckoutAttempt) {
    setError('')
    setProcessing(true)
    try {
      const result = await sendCheckout(pending)
      saveAttempt(null)
      setAttempt(null)
      await queryClient.invalidateQueries({
        queryKey: ['user', pending.userId],
      })
      await navigate({
        to: '/orders/$orderId',
        params: { orderId: result.order_id },
      })
    } catch (cause) {
      if (cause instanceof CheckoutError && cause.definite) {
        saveAttempt(null)
        setAttempt(null)
      }
      setError(
        cause instanceof Error
          ? cause.message
          : 'Something went wrong. Please retry.',
      )
    } finally {
      setProcessing(false)
    }
  }
  const form = useForm({
    defaultValues: {
      name: '',
      email: auth.user?.email ?? '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'US' as const,
    },
    validators: { onSubmit: addressSchema },
    onSubmit: async ({ value }) => {
      if (!auth.user || cart.busy || cart.error || processing) return
      const pending = activeAttempt ?? {
        userId: auth.user.id,
        items: cart.lines.map((line) => ({
          ...line,
          updated_at: line.updated_at!,
        })),
        address: addressSchema.parse(value),
        payment_result: payment,
        idempotency_key: crypto.randomUUID(),
      }
      try {
        saveAttempt(pending)
      } catch {
        setError(
          'Your browser could not preserve this checkout attempt. Enable session storage and try again.',
        )
        return
      }
      setAttempt(pending)
      await completeAttempt(pending)
    },
  })
  useEffect(() => {
    if (auth.user && !form.state.values.email)
      form.setFieldValue('email', auth.user.email ?? '')
  }, [auth.user?.id])
  if (auth.loading || cart.loading)
    return <Loading label="Preparing checkout…" />
  if (!auth.user)
    return (
      <div className="wrap section account-panel">
        <LockKeyhole size={30} />
        <h1>A place for your order.</h1>
        <p>Sign in to save your bag and continue to checkout.</p>
        <Button asChild>
          <Link to="/auth" search={{ redirect: '/checkout' }}>
            Sign in to continue
            <ArrowRight size={17} />
          </Link>
        </Button>
      </div>
    )
  if (activeAttempt)
    return (
      <div className="wrap section account-panel">
        <FlaskConical size={30} />
        <h1>
          {processing
            ? 'Confirming your demo order…'
            : 'Pick up this checkout attempt.'}
        </h1>
        <p>
          Your attempt for {activeAttempt.address.name} is saved in this tab.
          Recover it to check the result safely.
        </p>
        <p>No real money will be charged.</p>
        {error && <ErrorState message={error} />}
        <Button
          disabled={processing}
          onClick={() => void completeAttempt(activeAttempt)}
        >
          {processing ? 'One moment…' : 'Recover checkout attempt'}
          <ArrowRight size={16} />
        </Button>
        <Link to="/orders" className="text-link">
          View saved orders
        </Link>
      </div>
    )
  if (cart.error)
    return (
      <div className="wrap section">
        <ErrorState message={cart.error} retry={cart.retry} />
      </div>
    )
  if (!cart.lines.length)
    return (
      <Empty
        title="Your bag is waiting for a favorite."
        description="Add a little something before checking out."
      />
    )
  return (
    <div className="wrap section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Almost yours</p>
          <h1>The final little details.</h1>
        </div>
        <Link to="/cart" className="text-link">
          <ArrowLeft size={16} />
          Back to your bag
        </Link>
      </div>
      <div className="mock-banner">
        <FlaskConical size={21} />
        <div>
          <strong>This is a simulated checkout.</strong>
          <p>
            No card details, no real charge, no shipment. Your demo order will
            be saved to your account.
          </p>
        </div>
      </div>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit().then(() => {
            requestAnimationFrame(() =>
              document
                .querySelector<HTMLInputElement>('#main [aria-invalid="true"]')
                ?.focus(),
            )
          })
        }}
      >
        <div className="cart-layout checkout-layout">
          <div>
            <section className="checkout-section">
              <h2>
                <span>01</span>Where should it go?
              </h2>
              <div className="address-grid">
                {(Object.keys(labels) as (keyof typeof labels)[]).map(
                  (name) => (
                    <form.Field key={name} name={name}>
                      {(field) => (
                        <div className={`form-field field-${name}`}>
                          <label htmlFor={`shipping-${name}`}>
                            {labels[name]}
                          </label>
                          <Input
                            id={`shipping-${name}`}
                            name={name}
                            spellCheck={
                              name === 'email' ||
                              name === 'state' ||
                              name === 'zip'
                                ? false
                                : undefined
                            }
                            autoComplete={`shipping ${completions[name]}`}
                            type={name === 'email' ? 'email' : 'text'}
                            maxLength={name === 'state' ? 2 : 200}
                            inputMode={name === 'zip' ? 'numeric' : undefined}
                            placeholder={
                              name === 'state'
                                ? 'CA'
                                : name === 'zip'
                                  ? '94103'
                                  : undefined
                            }
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                name === 'state'
                                  ? e.target.value.toUpperCase()
                                  : e.target.value,
                              )
                            }
                            aria-invalid={!!field.state.meta.errors.length}
                            aria-describedby={`${name}-error`}
                          />
                          <span
                            className="field-error"
                            aria-live="polite"
                            id={`${name}-error`}
                          >
                            {field.state.meta.errors
                              .map((e) =>
                                typeof e === 'string' ? e : e?.message,
                              )
                              .join(' ')}
                          </span>
                        </div>
                      )}
                    </form.Field>
                  ),
                )}
                <div className="form-field field-country">
                  <label htmlFor="country">Country / region</label>
                  <Input
                    id="country"
                    value="United States"
                    autoComplete="shipping country-name"
                    readOnly
                  />
                  <small>US delivery in this demo.</small>
                </div>
              </div>
            </section>
            <section className="checkout-section">
              <h2>
                <span>02</span>Your good things
              </h2>
              {cart.lines.map((line) => (
                <BagLine key={line.sku} line={line} readOnly />
              ))}
            </section>
            <section className="checkout-section">
              <h2>
                <span>03</span>Try the demo payment
              </h2>
              <fieldset className="payment-options">
                <legend className="sr-only">Simulated payment result</legend>
                <label className={payment === 'succeeded' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === 'succeeded'}
                    onChange={() => setPayment('succeeded')}
                  />
                  <span>
                    <strong>Successful payment</strong>
                    <small>
                      Save a confirmed order and clear purchased items.
                    </small>
                  </span>
                </label>
                <label className={payment === 'failed' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === 'failed'}
                    onChange={() => setPayment('failed')}
                  />
                  <span>
                    <strong>Declined payment</strong>
                    <small>
                      Save a failed attempt and keep your bag intact.
                    </small>
                  </span>
                </label>
              </fieldset>
            </section>
          </div>
          <Summary>
            {error && <ErrorState message={error} />}
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(pending) => (
                <Button
                  type="submit"
                  size="lg"
                  className="full-width"
                  disabled={pending || cart.busy}
                >
                  {pending
                    ? 'Saving your order…'
                    : error
                      ? 'Retry mock payment'
                      : 'Place demo order'}
                  <ArrowRight size={16} />
                </Button>
              )}
            </form.Subscribe>
            {error && (
              <Button
                className="full-width refresh-bag"
                type="button"
                variant="outline"
                onClick={cart.retry}
              >
                Refresh bag
              </Button>
            )}
            <p className="secure-note">
              <FlaskConical size={14} />
              Mock payment · No real money charged
            </p>
          </Summary>
        </div>
      </form>
    </div>
  )
}
