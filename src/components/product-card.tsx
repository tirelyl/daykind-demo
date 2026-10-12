import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Plus } from 'lucide-react'
import type { Product } from '../lib/catalog'
import { categories, money } from '../lib/catalog'
import { useCart } from '../lib/cart'
import { Button } from './ui/button'

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product
  priority?: boolean
}) {
  const cart = useCart()
  return (
    <article className="product-card">
      <div className="product-image">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            width={480}
            height={480}
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <Button
          className="quick-add"
          variant="secondary"
          size="icon"
          disabled={cart.busy || cart.loading || !!cart.error}
          aria-label={`Add ${product.name} to bag`}
          onClick={() => {
            void cart
              .add({
                product_id: product.id,
                sku: product.variants[0].id,
                quantity: 1,
              })
              .catch(() => {})
          }}
        >
          <Plus size={19} />
        </Button>
      </div>
      <div className="product-meta">
        <div>
          <p className="product-category">
            {categories.find((c) => c.id === product.category)?.name}
          </p>
          <h3>
            <Link to="/products/$productId" params={{ productId: product.id }}>
              {product.name}
            </Link>
          </h3>
        </div>
        <span className="product-price">{money(product.price)}</span>
      </div>
      <div
        className="product-colors"
        role="img"
        aria-label={`${product.variants.length} color options`}
      >
        {product.variants.map((v) => (
          <span key={v.id} style={{ backgroundColor: v.color }} />
        ))}
        <ArrowUpRight className="product-arrow" size={16} />
      </div>
    </article>
  )
}
