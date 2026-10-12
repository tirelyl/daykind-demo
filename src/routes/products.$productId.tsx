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
        title="This one's wandered off."
        description="We couldn't find that essential. There's plenty more to discover."
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
        <Link to="/">Home</Link>
        <span>/</span>
        <Link
          to="/products"
          search={{
            ...defaultSearch,
            category: p.category as 'home' | 'kitchen' | 'carry',
          }}
        >
          {categories.find((c) => c.id === p.category)?.name}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="detail-layout">
        <div className="detail-image">
          {p.badge && <span className="product-badge">{p.badge}</span>}
          <img
            src={p.image}
            alt={p.name}
            width={900}
            height={900}
            fetchPriority="high"
          />
          <span className="image-note">The everyday collection</span>
        </div>
        <div className="detail-copy">
          <p className="section-kicker">
            {categories.find((c) => c.id === p.category)?.name}
          </p>
          <h1>{p.name}</h1>
          <div className="detail-rating">
            <Star size={14} fill="currentColor" />
            <span>{p.rating.toFixed(1)}</span>
            <span className="muted">({p.reviewCount} demo reviews)</span>
          </div>
          <p className="detail-price">{money(p.price)}</p>
          <p className="detail-description">{p.description}</p>
          <fieldset className="variant-picker">
            <legend>
              Color <span>{variant.label}</span>
            </legend>
            <div>
              {p.variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  aria-label={`Color ${v.label}`}
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
              <small>Color choices are illustrative in this demo.</small>
            )}
          </fieldset>
          <p className="stock-note">
            <span className="tiny-dot" />
            {available > 0
              ? `${available} available · Ready for a new home`
              : 'All available items are in your bag'}
          </p>
          <div className="add-row">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                aria-label="Increase quantity"
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
                  Added to your bag
                </>
              ) : (
                <>
                  Add to bag
                  <Plus size={17} />
                </>
              )}
            </Button>
          </div>
          {added && (
            <Link className="text-link added-link" to="/cart">
              View your bag
              <ArrowRight size={16} />
            </Link>
          )}
          {cart.error && <ErrorState message={cart.error} retry={cart.retry} />}
          <div className="detail-shipping">
            <Truck size={19} />
            <span>
              Free US shipping on orders $75+
              <small>$6.99 flat rate below $75 · Demo delivery</small>
            </span>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="details">
              <AccordionTrigger>The little details</AccordionTrigger>
              <AccordionContent>
                {p.material}. Selected for everyday usefulness and a little
                character. SKU: {variant.id}. Product information is
                illustrative for this demonstration.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Care & keeping</AccordionTrigger>
              <AccordionContent>
                Keep clean with a soft, dry cloth. Follow the maker's care
                instructions for the material. Images and specifications are
                demonstration content.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & returns</AccordionTrigger>
              <AccordionContent>
                US delivery only in this demo. Shipping is $6.99, or free from
                $75. A 30-day return policy is shown for presentation. No
                physical orders are shipped.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <section className="section related">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Better together</p>
            <h2>A few more good things.</h2>
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
