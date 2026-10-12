import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
            alt={t(product.name)}
            width={160}
            height={160}
          />
        </Link>
        <div className="bag-info">
          <Link to="/products/$productId" params={{ productId: product.id }}>
            <h3>{t(product.name)}</h3>
          </Link>
          <p>{t(variant.label)}</p>
          <span>{money(product.price)}</span>
          {!readOnly && (
            <div className="quantity-control">
              <button
                aria-label={t('Decrease {{name}} quantity', {
                  name: t(product.name),
                })}
                disabled={line.quantity <= 1 || cart.busy}
                onClick={() => cart.update(line, line.quantity - 1)}
              >
                <Minus size={12} />
              </button>
              <span>{line.quantity}</span>
              <button
                aria-label={t('Increase {{name}} quantity', {
                  name: t(product.name),
                })}
                disabled={
                  line.quantity >= Math.min(99, variant.stock) || cart.busy
                }
                onClick={() => cart.update(line, line.quantity + 1)}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
          {readOnly && (
            <small>{t('Qty {{count}}', { count: line.quantity })}</small>
          )}
        </div>
        <div className="bag-line-end">
          <strong>{money(product.price * line.quantity)}</strong>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('Remove {{name}}', { name: t(product.name) })}
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
        {t('This item is no longer available.')}
        <Button variant="outline" onClick={() => cart.update(line, 0)}>
          {t('Remove item')}
        </Button>
      </div>
    )
  }
}
export function Summary({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()

  const cart = useCart()
  return (
    <aside className="order-summary">
      <h2>{t('A little summary')}</h2>
      <div className="summary-row">
        <span>{t('Subtotal')}</span>
        <span>{money(cart.totals.subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>{t('Shipping')}</span>
        <span>
          {cart.totals.shipping === 0
            ? t('On us')
            : money(cart.totals.shipping)}
        </span>
      </div>
      <div className="summary-row">
        <span>
          {t('Tax')} <small>{t('(demo)')}</small>
        </span>
        <span>{money(0)}</span>
      </div>
      <div className="summary-total">
        <span>
          {t('Total')} <small>USD</small>
        </span>
        <strong>{money(cart.totals.total)}</strong>
      </div>
      {children}
      <div className="shipping-progress">
        <Truck size={17} />
        <p>
          {cart.totals.subtotal >= 7500
            ? t('Your order ships for free.')
            : t("You're {{amount}} away from free shipping.", {
                amount: money(7500 - cart.totals.subtotal),
              })}
        </p>
      </div>
      <div className="progress-track">
        <span
          style={{ width: `${Math.min(100, cart.totals.subtotal / 75)}%` }}
        />
      </div>
      <p className="summary-note">
        {t('Demo store. No real payment will be taken.')}
      </p>
    </aside>
  )
}
