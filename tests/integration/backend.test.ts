import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const anon = process.env.SUPABASE_ANON_KEY!
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const address = {
  name: 'Alex Taylor',
  email: 'alex@example.com',
  address: '125 Market Street',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103',
  country: 'US',
}
const users: { id: string; client: SupabaseClient; token: string }[] = []
const lamp = { product_id: 'ee-47', sku: 'ee-47-standard', quantity: 1 }
async function cart() {
  const { data, error } = await users[0].client
    .from('cart_items')
    .select('product_id,sku,quantity,updated_at')
    .order('sku')
  expect(error).toBeNull()
  return data!
}
async function checkout(
  items: unknown[],
  key = crypto.randomUUID(),
  payment = 'succeeded',
  token = users[0].token,
) {
  const response = await fetch(`${url}/functions/v1/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anon,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items,
      address,
      idempotency_key: key,
      payment_result: payment,
    }),
  })
  return { status: response.status, body: await response.json() }
}
beforeAll(async () => {
  for (let i = 0; i < 2; i++) {
    const client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await client.auth.signUp({
      email: `integration-${Date.now()}-${i}@example.com`,
      password: 'EverydayTest123!',
    })
    expect(error).toBeNull()
    expect(data.session).not.toBeNull()
    users.push({ id: data.user!.id, client, token: data.session!.access_token })
  }
})
afterAll(async () => {
  for (const user of users) await admin.auth.admin.deleteUser(user.id)
})
describe('real Supabase Auth, RLS and checkout', () => {
  it('blocks unauthenticated access, cross-user inserts and client order writes', async () => {
    const publicClient = createClient(url, anon, {
      auth: { persistSession: false },
    })
    expect(
      (await publicClient.from('cart_items').select()).error,
    ).not.toBeNull()
    expect(
      (
        await users[1].client
          .from('cart_items')
          .insert({ ...lamp, user_id: users[0].id })
      ).error,
    ).not.toBeNull()
    expect(
      (await users[0].client.from('orders').insert({ user_id: users[0].id }))
        .error,
    ).not.toBeNull()
    expect(
      (await users[0].client.rpc('commit_checkout', {})).error,
    ).not.toBeNull()
    expect(
      (await checkout([lamp], crypto.randomUUID(), 'succeeded', anon)).status,
    ).toBe(401)
  })
  it('merges atomically by maximum and isolates bags', async () => {
    expect(
      (
        await users[0].client
          .from('cart_items')
          .insert({ ...lamp, user_id: users[0].id, quantity: 2 })
      ).error,
    ).toBeNull()
    expect(
      (
        await users[0].client.rpc('merge_guest_cart', {
          items: [lamp, { ...lamp, sku: 'ee-47-forest', quantity: 3 }],
        })
      ).error,
    ).toBeNull()
    expect((await cart()).map((line) => line.quantity).sort()).toEqual([2, 3])
    expect((await users[1].client.from('cart_items').select()).data).toEqual([])
    expect(
      (
        await users[0].client.rpc('merge_guest_cart', {
          items: [
            { ...lamp, quantity: 5 },
            { ...lamp, sku: 'invalid', quantity: 100 },
          ],
        })
      ).error,
    ).not.toBeNull()
    expect((await cart()).find((line) => line.sku === lamp.sku)?.quantity).toBe(
      2,
    )
  })
  it('rejects a stale cart version without creating an order', async () => {
    const snapshot = await cart()
    await users[0].client
      .from('cart_items')
      .update({ quantity: 1 })
      .eq('sku', lamp.sku)
    const result = await checkout(snapshot)
    expect(result.status).toBe(409)
    expect(result.body.code).toBe('CART_CHANGED')
    expect((await users[0].client.from('orders').select()).data).toEqual([])
  })
  it('records declined payment and preserves the bag', async () => {
    const before = await cart()
    const result = await checkout(before, crypto.randomUUID(), 'failed')
    expect(result.status).toBe(200)
    expect(result.body.payment_status).toBe('failed')
    expect(await cart()).toEqual(before)
    const { data } = await users[0].client
      .from('orders')
      .select()
      .eq('id', result.body.order_id)
      .single()
    expect(data.status).toBe('payment_failed')
  })
  it('recomputes trusted prices, commits once under concurrent retries and leaves later additions intact', async () => {
    const snapshot = await cart()
    await users[0].client.from('cart_items').insert({
      user_id: users[0].id,
      product_id: 'ee-49',
      sku: 'ee-49-standard',
      quantity: 1,
    })
    const key = crypto.randomUUID()
    const results = await Promise.all([
      checkout(
        snapshot.map((line) => ({ ...line, price: 1 })),
        key,
      ),
      checkout(snapshot, key),
    ])
    expect(results.map((r) => r.status)).toEqual([200, 200])
    expect(results[0].body.order_id).toBe(results[1].body.order_id)
    const { data: order } = await users[0].client
      .from('orders')
      .select('*,order_items(*)')
      .eq('id', results[0].body.order_id)
      .single()
    expect(order.subtotal).toBe(19200)
    expect(order.shipping).toBe(0)
    expect(order.order_items).toHaveLength(2)
    expect((await cart()).map((line) => line.sku)).toEqual(['ee-49-standard'])
    expect((await checkout(snapshot, key)).body.order_id).toBe(order.id)
    expect((await checkout(snapshot, key, 'failed')).status).toBe(409)
    expect((await users[1].client.from('orders').select()).data).toEqual([])
    expect((await users[1].client.from('order_items').select()).data).toEqual(
      [],
    )
    expect(
      (
        await users[0].client
          .from('orders')
          .update({ status: 'payment_failed' })
          .eq('id', order.id)
      ).error,
    ).not.toBeNull()
  })
  it('rolls back order, line items and cart cleanup when a later constraint fails', async () => {
    const before = await cart()
    const { count: orderCount } = await admin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', users[0].id)
    const { error } = await admin.rpc('commit_checkout', {
      p_user: users[0].id,
      p_key: crypto.randomUUID(),
      p_hash: 'rollback-test',
      p_address: address,
      p_expected: before,
      p_success: true,
      p_items: [
        {
          ...before[0],
          name: 'Test snapshot',
          image: '/images/product-49.webp',
          variant: 'Natural',
          unit_price: 1600,
          quantity: 100,
        },
      ],
    })
    expect(error).not.toBeNull()
    expect(await cart()).toEqual(before)
    const { count: afterCount } = await admin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', users[0].id)
    expect(afterCount).toBe(orderCount)
  })
  it('rejects invalid SKU and quantity and leaves all data untouched', async () => {
    const snapshot = await cart()
    for (const patch of [
      { sku: 'missing' },
      { quantity: 100 },
      { quantity: 1.5 },
    ])
      expect(
        (await checkout(snapshot.map((line) => ({ ...line, ...patch }))))
          .status,
      ).toBe(400)
    expect(await cart()).toEqual(snapshot)
  })
})
