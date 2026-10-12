import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import type { Product } from '../../supabase/functions/_shared/catalog'

export { categories, products } from '../../supabase/functions/_shared/catalog'
export type { Product } from '../../supabase/functions/_shared/catalog'
export {
  money,
  totals,
  resolveLine,
} from '../../supabase/functions/_shared/commerce'
export type {
  CartLine,
  Address,
} from '../../supabase/functions/_shared/commerce'
export const searchSchema = z.object({
  q: z.string().max(200).catch(''),
  category: z.enum(['all', 'home', 'kitchen', 'carry']).catch('all'),
  price: z.enum(['all', 'under25', '25to75', 'over75']).catch('all'),
  sort: z
    .enum(['featured', 'price-asc', 'price-desc', 'name'])
    .catch('featured'),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
})
export type ProductSearch = z.infer<typeof searchSchema>
export const defaultSearch = searchSchema.parse({})
export async function catalogRequest<T>(path: string): Promise<T> {
  const response = await fetch(`/api/catalog/${path}`)
  if (!response.ok)
    throw new Error('The collection could not be loaded. Please try again.')
  return response.json()
}
export const catalogOptions = (search: ProductSearch) =>
  queryOptions({
    queryKey: ['catalog', search],
    queryFn: () =>
      catalogRequest<{ products: Product[]; total: number; pages: number }>(
        `products?${new URLSearchParams(Object.entries(search).map(([k, v]) => [k, String(v)]))}`,
      ),
    staleTime: 60_000,
  })
export const productOptions = (id: string) =>
  queryOptions({
    queryKey: ['product', id],
    queryFn: () => catalogRequest<Product | null>(`products/${id}`),
    staleTime: 60_000,
  })
