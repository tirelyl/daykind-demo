import { createClient } from 'npm:@supabase/supabase-js@2.117.3'
import {
  resolveLine,
  validateAddress,
  validateCartSnapshot,
} from '../_shared/commerce.ts'
import type { CartLine } from '../_shared/commerce.ts'
const allowedOrigins = (
  Deno.env.get('ALLOWED_ORIGINS') ??
  'http://localhost:3000,http://127.0.0.1:3000'
).split(',')
Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin':
      origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers })
  if (origin && !allowedOrigins.includes(origin))
    return reply({ error: 'Origin not allowed' }, 403)
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers })
  if (request.method !== 'POST')
    return reply({ error: 'Method not allowed' }, 405)
  const jwt = request.headers.get('authorization')?.replace(/^Bearer /i, '')
  if (!jwt) return reply({ error: 'Please sign in to check out.' }, 401)
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(jwt)
  if (authError || !user)
    return reply(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  try {
    const body = await request.json()
    if (
      !body ||
      typeof body !== 'object' ||
      !validateAddress(body.address) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        body.idempotency_key,
      ) ||
      !['succeeded', 'failed'].includes(body.payment_result) ||
      !validateCartSnapshot(body.items)
    )
      return reply({ error: 'Please check your address and bag.' }, 400)
    const expected = (body.items as CartLine[])
      .map(({ product_id, sku, quantity, updated_at }) => ({
        product_id,
        sku,
        quantity,
        updated_at,
      }))
      .sort((a, b) => a.sku.localeCompare(b.sku))
    if (
      new Set(expected.map((line) => line.sku)).size !== expected.length ||
      expected.some(
        (line) =>
          !line.updated_at || !Number.isFinite(Date.parse(line.updated_at)),
      )
    )
      return reply({ error: 'Please refresh your bag and try again.' }, 400)
    const requestHash = [
      ...new Uint8Array(
        await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(
            JSON.stringify({
              expected,
              address: body.address,
              payment_result: body.payment_result,
            }),
          ),
        ),
      ),
    ]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const { data: existing, error: existingError } = await admin
      .from('orders')
      .select('id,payment_status,request_hash')
      .eq('user_id', user.id)
      .eq('idempotency_key', body.idempotency_key)
      .maybeSingle()
    if (existingError) throw existingError
    if (existing)
      return existing.request_hash === requestHash
        ? reply({
            order_id: existing.id,
            payment_status: existing.payment_status,
          })
        : reply(
            { error: 'This checkout attempt has changed. Please start again.' },
            409,
          )
    const priced = expected.map((line) => {
      const { product, variant } = resolveLine(line)
      return {
        product_id: product.id,
        sku: variant.id,
        quantity: line.quantity,
        unit_price: product.price,
        name: product.name,
        image: product.image,
        variant: variant.label,
      }
    })
    const { data, error } = await admin.rpc('commit_checkout', {
      p_user: user.id,
      p_key: body.idempotency_key,
      p_hash: requestHash,
      p_address: body.address,
      p_items: priced,
      p_expected: expected,
      p_success: body.payment_result === 'succeeded',
    })
    if (error) {
      if (error.message.includes('CART_CHANGED'))
        return reply(
          {
            error:
              'Your bag changed in another tab. Refresh your bag before placing this order.',
            code: 'CART_CHANGED',
          },
          409,
        )
      if (error.message.includes('IDEMPOTENCY_CONFLICT'))
        return reply(
          { error: 'This checkout attempt has changed. Please start again.' },
          409,
        )
      console.error('Checkout transaction failed', error.code)
      return reply(
        {
          error:
            'We could not save your order. Your bag is safe; please retry.',
        },
        500,
      )
    }
    return reply(data)
  } catch (error) {
    if (error instanceof SyntaxError)
      return reply({ error: 'Invalid request.' }, 400)
    if (error instanceof Error && error.message.includes('unavailable'))
      return reply({ error: error.message }, 400)
    console.error('Checkout failed')
    return reply(
      { error: 'We could not complete checkout. Please retry.' },
      500,
    )
  }
})
