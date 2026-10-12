import { describe, expect, it } from 'vitest'
import {
  mergeCart,
  resolveLine,
  totals,
  validateAddress,
} from '../../supabase/functions/_shared/commerce'
import { products } from '../../supabase/functions/_shared/catalog'

const natural = { product_id: 'ee-47', sku: 'ee-47-standard', quantity: 1 }
const forest = { ...natural, sku: 'ee-47-forest' }
describe('money and delivery', () => {
  it('uses integer cents and includes shipping below the exact threshold', () => {
    expect(totals(7499)).toEqual({
      subtotal: 7499,
      shipping: 699,
      tax: 0,
      total: 8198,
    })
    expect(totals(7500)).toEqual({
      subtotal: 7500,
      shipping: 0,
      tax: 0,
      total: 7500,
    })
    expect(totals(0).total).toBe(0)
  })
})
describe('catalog and cart', () => {
  it('keeps variants distinct while merging each SKU by maximum quantity', () => {
    const merged = mergeCart(
      [{ ...natural, quantity: 2 }],
      [natural, { ...forest, quantity: 3 }],
    )
    expect(merged).toHaveLength(2)
    expect(merged.find((line) => line.sku === natural.sku)?.quantity).toBe(2)
    expect(mergeCart(merged, [natural, forest])).toEqual(merged)
  })
  it('rejects unknown products, cross-product SKUs and invalid quantities', () => {
    for (const quantity of [0, -1, 100, 1.5, 10])
      expect(() => resolveLine({ ...natural, quantity })).toThrow()
    expect(() => resolveLine({ ...natural, product_id: 'ee-49' })).toThrow()
    expect(() => resolveLine({ ...natural, sku: 'missing' })).toThrow()
  })
  it('provides 30 unique products with locally hosted images and unique SKUs', () => {
    expect(products).toHaveLength(30)
    expect(new Set(products.map((p) => p.id)).size).toBe(30)
    const skus = products.flatMap((p) => p.variants.map((v) => v.id))
    expect(new Set(skus).size).toBe(skus.length)
    expect(
      products.every(
        (p) => p.image.startsWith('/images/') && Number.isInteger(p.price),
      ),
    ).toBe(true)
  })
})
it('validates the same US address shape used by checkout', () => {
  const address = {
    name: 'A Taylor',
    email: 'taylor@example.com',
    address: '125 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    country: 'US',
  }
  expect(validateAddress(address)).toBe(true)
  for (const changes of [
    { country: 'GB' },
    { zip: 'abc' },
    { state: 'California' },
    { email: 'invalid' },
    { name: '' },
  ])
    expect(validateAddress({ ...address, ...changes })).toBe(false)
})
