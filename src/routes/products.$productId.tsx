import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Check, Minus, Plus, Star, Truck } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion'
import { Button } from '../components/ui/button'
import { Empty, ErrorState, Loading } from '../components/states'
import { ProductCard } from '../components/product-card'
import {
  categories,
  catalogOptions,
  defaultSearch,
  money,
  productOptions,
} from '../lib/catalog'
import { useCart } from '../lib/cart'

export const Route = createFileRoute('/products/$productId')({
  component: ProductDetail,
})
function ProductDetail() {
  const { t } = useTranslation()

  const { productId } = Route.useParams()
  const query = useQuery(productOptions(productId))
  const related = useQuery(catalogOptions(defaultSearch))
  const cart = useCart()
  const [variantIndex, setVariantIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  if (query.isPending) return <Loading />
  if (query.isError)
    return (
      <ErrorState
        message={query.error.message}
        retry={() => void query.refetch()}
      />
    )
  if (!query.data)
    return (
      <Empty
        title={t("This one's wandered off.")}
        description={t(
          "We couldn't find that essential. There's plenty more to discover.",
        )}
      />
    )
  const p = query.data
  const variant = p.variants[variantIndex] ?? p.variants[0]
  const existing =
    cart.lines.find((line) => line.sku === variant.id)?.quantity ?? 0
  const available = Math.min(99, variant.stock) - existing
  return (
    <div className="wrap section detail-page">
      <div className="breadcrumbs">
        <Link to="/">{t('Home')}</Link>
        <span>/</span>
        <Link
          to="/products"
          search={{
            ...defaultSearch,
            category: p.category as 'home' | 'kitchen' | 'carry',
          }}
        >
          {t(categories.find((c) => c.id === p.category)?.name ?? '')}
        </Link>
        <span>/</span>
        <span>{t(p.name)}</span>
      </div>
      <section className="detail-layout">
        <div className="detail-image">
          {p.badge && <span className="product-badge">{t(p.badge)}</span>}
          <img
            src={p.image}
            alt={t(p.name)}
            width={900}
            height={900}
            fetchPriority="high"
          />
          <span className="image-note">{t('The everyday collection')}</span>
        </div>
        <div className="detail-copy">
          <p className="section-kicker">
            {t(categories.find((c) => c.id === p.category)?.name ?? '')}
          </p>
          <h1>{t(p.name)}</h1>
          <div className="detail-rating">
            <Star size={14} fill="currentColor" />
            <span>{p.rating.toFixed(1)}</span>
            <span className="muted">
              ({t('{{count}} demo reviews', { count: p.reviewCount })})
            </span>
          </div>
          <p className="detail-price">{money(p.price)}</p>
          <p className="detail-description">{t(p.description)}</p>
          <fieldset className="variant-picker">
            <legend>
              {t('Color')}
              <span>{t(variant.label)}</span>
            </legend>
            <div>
              {p.variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  aria-label={t('Color {{color}}', { color: t(v.label) })}
                  aria-pressed={variant.id === v.id}
                  className={variant.id === v.id ? 'selected' : ''}
                  onClick={() => {
                    setVariantIndex(i)
                    setQuantity(1)
                    setAdded(false)
                  }}
                >
                  <span style={{ backgroundColor: v.color }} />
                </button>
              ))}
            </div>
            {p.variants.length > 1 && (
              <small>{t('Color choices are illustrative in this demo.')}</small>
            )}
          </fieldset>
          <p className="stock-note">
            <span className="tiny-dot" />
            {available > 0
              ? t('{{count}} available · Ready for a new home', {
                  count: available,
                })
              : t('All available items are in your bag')}
          </p>
          <div className="add-row">
            <div className="quantity-control">
              <button
                aria-label={t('Decrease quantity')}
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                aria-label={t('Increase quantity')}
                disabled={quantity >= available}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <Button
              size="lg"
              disabled={
                cart.busy ||
                cart.loading ||
                !!cart.error ||
                available < quantity
              }
              onClick={() => {
                void cart
                  .add({ product_id: p.id, sku: variant.id, quantity })
                  .then(() => setAdded(true))
                  .catch(() => {})
              }}
            >
              {added ? (
                <>
                  <Check size={17} />
                  {t('Added to your bag')}
                </>
              ) : (
                <>
                  {t('Add to bag')}
                  <Plus size={17} />
                </>
              )}
            </Button>
          </div>
          {added && (
            <Link className="text-link added-link" to="/cart">
              {t('View your bag')}
              <ArrowRight size={16} />
            </Link>
          )}
          {cart.error && <ErrorState message={cart.error} retry={cart.retry} />}
          <div className="detail-shipping">
            <Truck size={19} />
            <span>
              {t('Free US shipping on orders $75+')}
              <small>{t('$6.99 flat rate below $75 · Demo delivery')}</small>
            </span>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="details">
              <AccordionTrigger>{t('The little details')}</AccordionTrigger>
              <AccordionContent>
                {t(p.material, { context: 'material' })}
                {t(
                  '. Selected for everyday usefulness and a little character. SKU:',
                )}
                {variant.id}
                {t(
                  '. Product information is illustrative for this demonstration.',
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>{t('Care & keeping')}</AccordionTrigger>
              <AccordionContent>
                {t(
                  "Keep clean with a soft, dry cloth. Follow the maker's care instructions for the material. Images and specifications are demonstration content.",
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>{t('Shipping & returns')}</AccordionTrigger>
              <AccordionContent>
                {t(
                  'US delivery only in this demo. Shipping is $6.99, or free from $75. A 30-day return policy is shown for presentation. No physical orders are shipped.',
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <section className="section related">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t('Better together')}</p>
            <h2>{t('A few more good things.')}</h2>
          </div>
        </div>
        <div className="product-grid">
          {related.data?.products
            .filter((item) => item.id !== p.id)
            .slice(0, 4)
            .map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
        </div>
      </section>
    </div>
  )
}
