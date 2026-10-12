import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash2, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { money, resolveLine } from '../lib/catalog'
import type { CartLine } from '../lib/catalog'
import { useCart } from '../lib/cart'
import { Button } from './ui/button'

export function BagLine({
  line,
  readOnly = false,
}: {
  line: CartLine
  readOnly?: boolean
}) {
  const cart = useCart()
  try {
    const { product, variant } = resolveLine(line)
    return (
      <div className="bag-line">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="bag-image"
        >
          <img
            src={product.image}
            alt={product.name}
            width={160}
            height={160}
          />
        </Link>
        <div className="bag-info">
          <Link to="/products/$productId" params={{ productId: product.id }}>
            <h3>{product.name}</h3>
          </Link>
          <p>{variant.label}</p>
          <span>{money(product.price)}</span>
          {!readOnly && (
            <div className="quantity-control">
              <button
                aria-label={`Decrease ${product.name} quantity`}
                disabled={line.quantity <= 1 || cart.busy}
                onClick={() => cart.update(line, line.quantity - 1)}
              >
                <Minus size={12} />
              </button>
              <span>{line.quantity}</span>
              <button
                aria-label={`Increase ${product.name} quantity`}
                disabled={
                  line.quantity >= Math.min(99, variant.stock) || cart.busy
                }
                onClick={() => cart.update(line, line.quantity + 1)}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
          {readOnly && <small>Qty {line.quantity}</small>}
        </div>
        <div className="bag-line-end">
          <strong>{money(product.price * line.quantity)}</strong>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${product.name}`}
              disabled={cart.busy}
              onClick={() => cart.update(line, 0)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    )
  } catch {
    return (
      <div className="error-state">
        This item is no longer available.
        <Button variant="outline" onClick={() => cart.update(line, 0)}>
          Remove item
        </Button>
      </div>
    )
  }
}
export function Summary({ children }: { children?: ReactNode }) {
  const cart = useCart()
  return (
    <aside className="order-summary">
      <h2>A little summary</h2>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{money(cart.totals.subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>
          {cart.totals.shipping === 0 ? 'On us' : money(cart.totals.shipping)}
        </span>
      </div>
      <div className="summary-row">
        <span>
          Tax <small>(demo)</small>
        </span>
        <span>$0.00</span>
      </div>
      <div className="summary-total">
        <span>
          Total <small>USD</small>
        </span>
        <strong>{money(cart.totals.total)}</strong>
      </div>
      {children}
      <div className="shipping-progress">
        <Truck size={17} />
        <p>
          {cart.totals.subtotal >= 7500
            ? 'Your order ships for free.'
            : `You're ${money(7500 - cart.totals.subtotal)} away from free shipping.`}
        </p>
      </div>
      <div className="progress-track">
        <span
          style={{ width: `${Math.min(100, cart.totals.subtotal / 75)}%` }}
        />
      </div>
      <p className="summary-note">Demo store. No real payment will be taken.</p>
    </aside>
  )
}
