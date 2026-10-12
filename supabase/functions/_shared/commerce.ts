import { products } from './catalog.ts'

export type CartLine = {
  product_id: string
  sku: string
  quantity: number
  updated_at?: string
}
export type Address = {
  name: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  country: 'US'
}
export function validateCartSnapshot(
  value: unknown,
): value is (CartLine & { updated_at: string })[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) return false
  return (
    value.every(
      (line) =>
        line &&
        typeof line === 'object' &&
        typeof line.product_id === 'string' &&
        line.product_id.length <= 100 &&
        typeof line.sku === 'string' &&
        line.sku.length <= 100 &&
        Number.isInteger(line.quantity) &&
        line.quantity >= 1 &&
        line.quantity <= 99 &&
        typeof line.updated_at === 'string' &&
        Number.isFinite(Date.parse(line.updated_at)),
    ) && new Set(value.map((line) => line.sku)).size === value.length
  )
}
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  )
export function totals(subtotal: number) {
  const shipping = subtotal === 0 || subtotal >= 7500 ? 0 : 699
  return { subtotal, shipping, tax: 0, total: subtotal + shipping }
}
export function resolveLine(line: CartLine) {
  const product = products.find((p) => p.id === line.product_id)
  const variant = product?.variants.find((v) => v.id === line.sku)
  if (
    !product ||
    !variant ||
    !Number.isInteger(line.quantity) ||
    line.quantity < 1 ||
    line.quantity > Math.min(99, variant.stock)
  )
    throw new Error(
      'An item is unavailable or exceeds the available quantity. Please update your bag.',
    )
  return { ...line, product, variant }
}
export function mergeCart(remote: CartLine[], guest: CartLine[]) {
  const merged = new Map(remote.map((line) => [line.sku, { ...line }]))
  for (const line of guest) {
    resolveLine(line)
    const existing = merged.get(line.sku)
    merged.set(line.sku, {
      ...line,
      quantity: Math.max(existing?.quantity ?? 0, line.quantity),
    })
  }
  return [...merged.values()]
}
export function validateAddress(value: unknown): value is Address {
  if (!value || typeof value !== 'object') return false
  const a = value as Record<string, unknown>
  return (
    ['name', 'email', 'address', 'city', 'state', 'zip'].every(
      (key) =>
        typeof a[key] === 'string' &&
        a[key].trim().length > 0 &&
        a[key].length <= 200,
    ) &&
    a.country === 'US' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a.email)) &&
    /^\d{5}(-\d{4})?$/.test(String(a.zip)) &&
    /^[A-Z]{2}$/.test(String(a.state))
  )
}
