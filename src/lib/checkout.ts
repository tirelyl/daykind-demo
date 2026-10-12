import { z } from 'zod'
import { supabase } from './supabase'

export const addressSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(200),
  email: z.email('Enter a valid email.'),
  address: z.string().trim().min(3, 'Enter your street address.').max(200),
  city: z.string().trim().min(2, 'Enter your city.').max(200),
  state: z
    .string()
    .regex(/^[A-Z]{2}$/, 'Use a two-letter state code, e.g. CA.'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a US ZIP code.'),
  country: z.literal('US'),
})
const attemptSchema = z.object({
  userId: z.uuid(),
  idempotency_key: z.uuid(),
  address: addressSchema,
  payment_result: z.enum(['succeeded', 'failed']),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        sku: z.string(),
        quantity: z.number().int().min(1).max(99),
        updated_at: z.string(),
      }),
    )
    .min(1),
})
export type CheckoutAttempt = z.infer<typeof attemptSchema>
const storageKey = 'ee-checkout-attempt'
export function readAttempt(): CheckoutAttempt | null {
  try {
    const parsed = attemptSchema.safeParse(
      JSON.parse(sessionStorage.getItem(storageKey) || 'null'),
    )
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
export function saveAttempt(attempt: CheckoutAttempt | null) {
  if (attempt) sessionStorage.setItem(storageKey, JSON.stringify(attempt))
  else sessionStorage.removeItem(storageKey)
}
export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly definite: boolean,
  ) {
    super(message)
  }
}
export async function sendCheckout(attempt: CheckoutAttempt) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user.id !== attempt.userId)
    throw new CheckoutError(
      'Sign in to the account that started this checkout.',
      false,
    )
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(attempt),
      },
    )
    const result = await response.json()
    if (!response.ok)
      throw new CheckoutError(
        result.error || 'Checkout could not be completed. Please retry.',
        response.status >= 400 && response.status < 500,
      )
    return z
      .object({
        order_id: z.uuid(),
        payment_status: z.enum(['succeeded', 'failed']),
      })
      .parse(result)
  } catch (error) {
    if (error instanceof CheckoutError) throw error
    throw new CheckoutError(
      'The connection was interrupted. Recover this attempt safely, even if the order was already saved.',
      false,
    )
  }
}
