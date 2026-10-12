import { delay, http, HttpResponse } from 'msw'
import { categories, products } from '../../supabase/functions/_shared/catalog'
import { searchSchema } from '../lib/catalog'
import { chineseCatalog } from '../locales/catalog'

export const handlers = [
  http.get('/api/catalog/categories', async () => {
    await delay(180)
    return HttpResponse.json(categories)
  }),
  http.get('/api/catalog/products', async ({ request }) => {
    const url = new URL(request.url)
    await delay(url.searchParams.get('scenario') === 'slow' ? 1800 : 240)
    if (
      url.searchParams.get('scenario') === 'error' ||
      localStorage.getItem('ee-catalog-scenario') === 'error'
    )
      return HttpResponse.json({ error: 'Demo error' }, { status: 503 })
    const s = searchSchema.parse(Object.fromEntries(url.searchParams))
    let selected = products.filter(
      (p) =>
        (s.category === 'all' || p.category === s.category) &&
        (!s.q ||
          `${p.name} ${p.description} ${chineseCatalog[p.id].name} ${chineseCatalog[p.id].description}`
            .toLowerCase()
            .includes(s.q.toLowerCase().trim())) &&
        (s.price === 'all' ||
          (s.price === 'under25' && p.price < 2500) ||
          (s.price === '25to75' && p.price >= 2500 && p.price <= 7500) ||
          (s.price === 'over75' && p.price > 7500)),
    )
    if (
      url.searchParams.get('scenario') === 'empty' ||
      localStorage.getItem('ee-catalog-scenario') === 'empty'
    )
      selected = []
    if (s.sort === 'price-asc') selected.sort((a, b) => a.price - b.price)
    if (s.sort === 'price-desc') selected.sort((a, b) => b.price - a.price)
    if (s.sort === 'name') {
      const chinese = url.searchParams.get('language') === 'zh'
      selected.sort((a, b) =>
        (chinese ? chineseCatalog[a.id].name : a.name).localeCompare(
          chinese ? chineseCatalog[b.id].name : b.name,
          chinese ? 'zh-CN' : 'en-US',
        ),
      )
    }
    if (s.sort === 'featured')
      selected.sort((a, b) => Number(b.featured) - Number(a.featured))
    return HttpResponse.json({
      products: selected.slice((s.page - 1) * 12, s.page * 12),
      total: selected.length,
      pages: Math.ceil(selected.length / 12),
    })
  }),
  http.get('/api/catalog/products/:id', async ({ params }) => {
    await delay(180)
    return HttpResponse.json(products.find((p) => p.id === params.id) ?? null)
  }),
]
