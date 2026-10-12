import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const cart = useCart()
  return (
    <article className="product-card">
      <div className="product-image">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          aria-label={t('View {{name}}', { name: t(product.name) })}
        >
          <img
            src={product.image}
            alt={t(product.name)}
            width={480}
            height={480}
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>
        {product.badge && (
          <span className="product-badge">{t(product.badge)}</span>
        )}
        <Button
          className="quick-add"
          variant="secondary"
          size="icon"
          disabled={cart.busy || cart.loading || !!cart.error}
          aria-label={t('Add {{name}} to bag', { name: t(product.name) })}
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
            {t(categories.find((c) => c.id === product.category)?.name ?? '')}
          </p>
          <h3>
            <Link to="/products/$productId" params={{ productId: product.id }}>
              {t(product.name)}
            </Link>
          </h3>
        </div>
        <span className="product-price">{money(product.price)}</span>
      </div>
      <div
        className="product-colors"
        role="img"
        aria-label={t('{{count}} color options', {
          count: product.variants.length,
        })}
      >
        {product.variants.map((v) => (
          <span key={v.id} style={{ backgroundColor: v.color }} />
        ))}
        <ArrowUpRight className="product-arrow" size={16} />
      </div>
    </article>
  )
}
