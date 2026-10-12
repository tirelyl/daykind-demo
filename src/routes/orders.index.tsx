import { useTranslation } from 'react-i18next'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../lib/auth'
import { useOrders } from '../lib/orders'
import { formatDate } from '../lib/i18n'
import { defaultSearch, money } from '../lib/catalog'
import { Empty, ErrorState, Loading } from '../components/states'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/orders/')({ component: Orders })
function Orders() {
  const { t } = useTranslation()

  const auth = useAuth()
  const query = useOrders()
  if (auth.loading) return <Loading />
  if (!auth.user)
    return (
      <div className="wrap section account-panel">
        <UserRound size={30} />
        <h1>{t('Your everyday, all together.')}</h1>
        <p>{t('Sign in to view your saved orders.')}</p>
        <Button asChild>
          <Link to="/auth" search={{ redirect: '/orders' }}>
            {t('Sign in')}
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    )
  if (query.isPending) return <Loading label={t('Finding your orders…')} />
  if (query.isError)
    return (
      <ErrorState
        message={t('Your orders could not be loaded.')}
        retry={() => void query.refetch()}
      />
    )
  return (
    <div className="wrap section orders-page">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{t('Make yourself at home')}</p>
          <h1>{t('Your good things.')}</h1>
          <p className="muted">{auth.user.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            void auth
              .signOut()
              .catch(() => toast.error(t('Sign out failed. Please retry.')))
          }
        >
          {t('Sign out')}
        </Button>
      </div>
      <p className="orders-demo-note">
        {t(
          'All orders below use simulated payments. No real money has been charged.',
        )}
      </p>
      {!query.data.length ? (
        <Empty
          title={t('The start of something good.')}
          description={t(
            'Your first everyday favorite is waiting in the collection.',
          )}
        />
      ) : (
        <div className="order-list">
          {query.data.map((order) => (
            <Link
              key={order.id}
              className="order-card"
              to="/orders/$orderId"
              params={{ orderId: order.id }}
            >
              <div className="order-card-images">
                {order.order_items.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.image}
                    alt={t(item.name)}
                    width={96}
                    height={96}
                  />
                ))}
              </div>
              <div className="order-card-copy">
                <h2>
                  {t('Order {{id}}', {
                    id: order.id.slice(0, 8).toUpperCase(),
                  })}
                </h2>
                <p>
                  {formatDate(order.created_at)} ·{' '}
                  {t('items', {
                    count: order.order_items.reduce(
                      (n, item) => n + item.quantity,
                      0,
                    ),
                  })}
                </p>
                <span className={`status-pill ${order.payment_status}`}>
                  {order.payment_status === 'succeeded'
                    ? t('Confirmed · Mock payment')
                    : t('Payment failed · Mock payment')}
                </span>
              </div>
              <strong>{money(order.total)}</strong>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      )}
      <Link to="/products" search={defaultSearch} className="text-link">
        {t('Find another favorite')}
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
