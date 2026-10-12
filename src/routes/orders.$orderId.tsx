import { useTranslation } from 'react-i18next'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, FlaskConical, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useOrders } from '../lib/orders'
import { formatDate } from '../lib/i18n'
import { money } from '../lib/catalog'
import { Empty, ErrorState, Loading } from '../components/states'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetail,
})
function OrderDetail() {
  const { t } = useTranslation()

  const { orderId } = Route.useParams()
  const auth = useAuth()
  const valid = /^[0-9a-f-]{36}$/i.test(orderId)
  const query = useOrders(
    valid ? orderId : '00000000-0000-0000-0000-000000000000',
  )
  if (auth.loading) return <Loading />
  if (!auth.user)
    return (
      <div className="wrap section account-panel">
        <h1>{t('Sign in to see your order.')}</h1>
        <Button asChild>
          <Link to="/auth" search={{ redirect: '/orders' }}>
            {t('Sign in')}
          </Link>
        </Button>
      </div>
    )
  if (query.isPending) return <Loading label={t('Opening your order…')} />
  if (query.isError)
    return (
      <ErrorState
        message={t('This order could not be loaded.')}
        retry={() => void query.refetch()}
      />
    )
  const order = query.data.at(0)
  if (!order)
    return (
      <Empty
        title={t("We couldn't find that order.")}
        description={t(
          "Your account's orders are available from the orders page.",
        )}
      />
    )
  const success = order.payment_status === 'succeeded'
  return (
    <div className="wrap section receipt-page">
      <Link className="text-link" to="/orders">
        <ArrowLeft size={16} />
        {t('All orders')}
      </Link>
      <div className="receipt-header">
        <div className={`receipt-icon ${success ? '' : 'failed'}`}>
          {success ? <Check size={27} /> : <X size={27} />}
        </div>
        <p className="section-kicker">
          {success
            ? t('A little everyday joy, confirmed')
            : t('Let’s give that another try')}
        </p>
        <h1>
          {success
            ? t('Good things are in the making.')
            : t('The demo payment was declined.')}
        </h1>
        <p>
          {success
            ? t(
                'Your demo order is saved. Thanks for making room for the little things.',
              )
            : t(
                'Your bag is still here. Start a new payment attempt when you’re ready.',
              )}
        </p>
        <span className={`status-pill ${order.payment_status}`}>
          {t(
            success
              ? 'Confirmed · Mock payment'
              : 'Payment failed · Mock payment',
          )}
        </span>
      </div>
      <div className="mock-banner">
        <FlaskConical size={20} />
        <p>
          {t(
            'This is a demonstration receipt. No real charge or shipment will occur.',
          )}
        </p>
      </div>
      <div className="receipt-layout">
        <section className="receipt-items">
          <div className="receipt-order-title">
            <h2>{t('Your good things')}</h2>
            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="muted">{formatDate(order.created_at, 'long')}</p>
          {order.order_items.map((item) => (
            <div key={item.id} className="bag-line">
              <Link
                to="/products/$productId"
                params={{ productId: item.product_id }}
                className="bag-image"
              >
                <img
                  src={item.image}
                  alt={t(item.name)}
                  width={160}
                  height={160}
                />
              </Link>
              <div className="bag-info">
                <h3>{t(item.name)}</h3>
                <p>
                  {t(item.variant)} ·{' '}
                  {t('Qty {{count}}', { count: item.quantity })}
                </p>
                <span>
                  {t('{{price}} each', { price: money(item.unit_price) })}
                </span>
              </div>
              <strong>{money(item.unit_price * item.quantity)}</strong>
            </div>
          ))}
        </section>
        <aside className="order-summary">
          <h2>{t('Order details')}</h2>
          <div className="summary-row">
            <span>{t('Subtotal')}</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>{t('Shipping')}</span>
            <span>{order.shipping ? money(order.shipping) : t('On us')}</span>
          </div>
          <div className="summary-row">
            <span>{t('Tax (demo)')}</span>
            <span>{money(0)}</span>
          </div>
          <div className="summary-total">
            <span>{t('Total USD')}</span>
            <strong>{money(order.total)}</strong>
          </div>
          <h3 className="address-title">{t('Delivery details')}</h3>
          <address>
            {order.address.name}
            <br />
            {order.address.address}
            <br />
            {order.address.city}, {order.address.state} {order.address.zip}
            <br />
            {t('United States')}
            <br />
            <span>{order.address.email}</span>
          </address>
          <p className="summary-note">
            {t(
              success
                ? 'Payment: simulated success'
                : 'Payment: simulated failure',
            )}
          </p>
          {!success && (
            <Button className="full-width" asChild>
              <Link to="/checkout">
                {t('Try a new mock payment')}
                <ArrowRight size={16} />
              </Link>
            </Button>
          )}
        </aside>
      </div>
    </div>
  )
}
