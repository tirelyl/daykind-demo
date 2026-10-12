import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProductCard } from '../components/product-card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet'
import { Loading, ErrorState } from '../components/states'
import {
  categories,
  catalogOptions,
  defaultSearch,
  searchSchema,
} from '../lib/catalog'
import type { ProductSearch } from '../lib/catalog'

export const Route = createFileRoute('/products/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: Products,
})
function Products() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const query = useQuery(catalogOptions(search))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draft, setDraft] = useState(search.q)
  useEffect(() => setDraft(search.q), [search.q])
  const update = (next: Partial<ProductSearch>) => {
    void navigate({
      search: { ...search, ...next, page: next.page ?? 1 },
      replace: false,
    })
  }
  const filterCount =
    Number(search.category !== 'all') + Number(search.price !== 'all')
  const filters = (
    <div className="filters">
      <fieldset>
        <legend>Collection</legend>
        {[{ id: 'all', name: 'All essentials' }, ...categories].map((c) => (
          <label
            key={c.id}
            className={search.category === c.id ? 'filter-selected' : ''}
          >
            <input
              type="radio"
              name="category"
              value={c.id}
              checked={search.category === c.id}
              onChange={() =>
                update({ category: c.id as ProductSearch['category'] })
              }
            />
            {c.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Price range</legend>
        {[
          { id: 'all', name: 'Any price' },
          { id: 'under25', name: 'Under $25' },
          { id: '25to75', name: '$25 – $75' },
          { id: 'over75', name: 'Over $75' },
        ].map((c) => (
          <label key={c.id}>
            <input
              type="radio"
              name="price"
              checked={search.price === c.id}
              onChange={() => update({ price: c.id as ProductSearch['price'] })}
            />
            {c.name}
          </label>
        ))}
      </fieldset>
      {filterCount > 0 && (
        <button
          className="text-link"
          onClick={() => update({ category: 'all', price: 'all' })}
        >
          Clear filters
          <X size={14} />
        </button>
      )}
      <div className="filter-note">
        Thoughtfully chosen.
        <br />
        Made for your everyday.
      </div>
    </div>
  )
  return (
    <div className="wrap section catalog-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>The collection</span>
      </div>
      <div className="catalog-title">
        <div>
          <p className="section-kicker">The everyday collection</p>
          <h1>
            {search.category === 'all'
              ? 'Good things, all together.'
              : categories.find((c) => c.id === search.category)?.name}
          </h1>
          <p>Useful objects. Quiet character. A little everyday joy.</p>
        </div>
        <span className="catalog-count">30 considered essentials</span>
      </div>
      <div className="catalog-layout">
        <aside className="desktop-filters" aria-label="Product filters">
          {filters}
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <form
              className="search-field"
              onSubmit={(e) => {
                e.preventDefault()
                update({ q: draft })
              }}
            >
              <Search size={18} />
              <Input
                type="search"
                aria-label="Search the collection"
                placeholder="Find your next favorite…"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (!e.target.value) update({ q: '' })
                }}
              />
              <button aria-label="Submit search" type="submit">
                <ArrowRight size={17} />
              </button>
            </form>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button className="mobile-filter-button" variant="outline">
                  <SlidersHorizontal size={17} />
                  Filters{filterCount ? ` (${filterCount})` : ''}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Find your everyday</SheetTitle>
                  <SheetDescription>Filter the collection.</SheetDescription>
                </SheetHeader>
                {filters}
                <Button
                  className="filter-done"
                  onClick={() => setFiltersOpen(false)}
                >
                  Show results
                </Button>
              </SheetContent>
            </Sheet>
            <label className="sort-label">
              <span className="sr-only">Sort products</span>
              <select
                value={search.sort}
                onChange={(e) =>
                  update({ sort: e.target.value as ProductSearch['sort'] })
                }
              >
                <option value="featured">Our favorites</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </label>
          </div>
          <div className="results-caption" aria-live="polite">
            {query.data
              ? `${query.data.total} ${query.data.total === 1 ? 'essential' : 'essentials'}${search.q ? ` for “${search.q}”` : ''}`
              : 'Finding the good things…'}
            {search.q && (
              <button
                onClick={() => {
                  setDraft('')
                  update({ q: '' })
                }}
              >
                Clear search
                <X size={13} />
              </button>
            )}
          </div>
          {query.isPending ? (
            <Loading />
          ) : query.isError ? (
            <ErrorState
              message={query.error.message}
              retry={() => void query.refetch()}
            />
          ) : query.data.products.length ? (
            <>
              <div className="product-grid catalog-grid">
                {query.data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <nav className="pagination" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={search.page === 1}
                  aria-label="Previous page"
                  onClick={() => update({ page: search.page - 1 })}
                >
                  <ArrowLeft size={16} />
                </Button>
                <span>
                  Page {search.page} of {query.data.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={search.page >= query.data.pages}
                  aria-label="Next page"
                  onClick={() => update({ page: search.page + 1 })}
                >
                  <ArrowRight size={16} />
                </Button>
              </nav>
            </>
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h2>No favorites found just yet.</h2>
              <p>Try a different search or give your filters a little room.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setDraft('')
                  void navigate({ search: defaultSearch })
                }}
              >
                Reset the collection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
