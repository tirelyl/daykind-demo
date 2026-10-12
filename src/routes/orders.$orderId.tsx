import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, FlaskConical, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useOrders } from '../lib/orders'
import { money } from '../lib/catalog'
import { Empty, ErrorState, Loading } from '../components/states'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetail,
})
function OrderDetail() {
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
        <h1>Sign in to see your order.</h1>
        <Button asChild>
          <Link to="/auth" search={{ redirect: '/orders' }}>
            Sign in
          </Link>
        </Button>
      </div>
    )
  if (query.isPending) return <Loading label="Opening your order…" />
  if (query.isError)
    return (
      <ErrorState
        message="This order could not be loaded."
        retry={() => void query.refetch()}
      />
    )
  const order = query.data.at(0)
  if (!order)
    return (
      <Empty
        title="We couldn't find that order."
        description="Your account's orders are available from the orders page."
      />
    )
  const success = order.payment_status === 'succeeded'
  return (
    <div className="wrap section receipt-page">
      <Link className="text-link" to="/orders">
        <ArrowLeft size={16} />
        All orders
      </Link>
      <div className="receipt-header">
        <div className={`receipt-icon ${success ? '' : 'failed'}`}>
          {success ? <Check size={27} /> : <X size={27} />}
        </div>
        <p className="section-kicker">
          {success
            ? 'A little everyday joy, confirmed'
            : 'Let’s give that another try'}
        </p>
        <h1>
          {success
            ? 'Good things are in the making.'
            : 'The demo payment was declined.'}
        </h1>
        <p>
          {success
            ? 'Your demo order is saved. Thanks for making room for the little things.'
            : 'Your bag is still here. Start a new payment attempt when you’re ready.'}
        </p>
        <span className={`status-pill ${order.payment_status}`}>
          {success ? 'Confirmed' : 'Payment failed'} · Mock payment
        </span>
      </div>
      <div className="mock-banner">
        <FlaskConical size={20} />
        <p>
          This is a demonstration receipt. No real charge or shipment will
          occur.
        </p>
      </div>
      <div className="receipt-layout">
        <section className="receipt-items">
          <div className="receipt-order-title">
            <h2>Your good things</h2>
            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="muted">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              dateStyle: 'long',
            })}
          </p>
          {order.order_items.map((item) => (
            <div key={item.id} className="bag-line">
              <Link
                to="/products/$productId"
                params={{ productId: item.product_id }}
                className="bag-image"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  width={160}
                  height={160}
                />
              </Link>
              <div className="bag-info">
                <h3>{item.name}</h3>
                <p>
                  {item.variant} · Qty {item.quantity}
                </p>
                <span>{money(item.unit_price)} each</span>
              </div>
              <strong>{money(item.unit_price * item.quantity)}</strong>
            </div>
          ))}
        </section>
        <aside className="order-summary">
          <h2>Order details</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shipping ? money(order.shipping) : 'On us'}</span>
          </div>
          <div className="summary-row">
            <span>Tax (demo)</span>
            <span>$0.00</span>
          </div>
          <div className="summary-total">
            <span>Total USD</span>
            <strong>{money(order.total)}</strong>
          </div>
          <h3 className="address-title">Delivery details</h3>
          <address>
            {order.address.name}
            <br />
            {order.address.address}
            <br />
            {order.address.city}, {order.address.state} {order.address.zip}
            <br />
            United States
            <br />
            <span>{order.address.email}</span>
          </address>
          <p className="summary-note">
            Payment: simulated {success ? 'success' : 'failure'}
          </p>
          {!success && (
            <Button className="full-width" asChild>
              <Link to="/checkout">
                Try a new mock payment
                <ArrowRight size={16} />
              </Link>
            </Button>
          )}
        </aside>
      </div>
    </div>
  )
}
