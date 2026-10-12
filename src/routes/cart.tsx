import { useTranslation } from 'react-i18next'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import { BagLine, Summary } from '../components/bag'
import { Button } from '../components/ui/button'
import { Empty, ErrorState, Loading } from '../components/states'
import { defaultSearch } from '../lib/catalog'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'

export const Route = createFileRoute('/cart')({ component: Cart })
function Cart() {
  const { t } = useTranslation()

  const cart = useCart()
  const { user } = useAuth()
  if (cart.loading) return <Loading label={t('Opening your bag…')} />
  if (cart.error)
    return (
      <div className="wrap section">
        <ErrorState message={cart.error} retry={cart.retry} />
      </div>
    )
  if (!cart.lines.length)
    return (
      <Empty
        title={t('Your bag has room for good things.')}
        description={t(
          'Find something that makes your everyday a little better.',
        )}
      />
    )
  return (
    <div className="wrap section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{t('Your everyday, in the making')}</p>
          <h1>
            {t('Your bag')}
            <span className="heading-count">({cart.count})</span>
          </h1>
        </div>
        <Link className="text-link" to="/products" search={defaultSearch}>
          <ArrowLeft size={16} />
          {t('Keep exploring')}
        </Link>
      </div>
      <div className="cart-layout">
        <div>
          <div className="bag-heading">
            <span>{t('The good things')}</span>
            <span>{t('Total')}</span>
          </div>
          {cart.lines.map((line) => (
            <BagLine key={line.sku} line={line} />
          ))}
          <p className="cart-persistence">
            {user
              ? t('Your bag is saved to your account.')
              : t(
                  'Your bag is saved on this device. Sign in at checkout to keep it with you.',
                )}
          </p>
        </div>
        <Summary>
          <Button asChild size="lg" className="full-width">
            <Link
              to={user ? '/checkout' : '/auth'}
              search={user ? undefined : { redirect: '/checkout' }}
            >
              {t('Continue to checkout')}
              <ArrowRight size={17} />
            </Link>
          </Button>
          <p className="secure-note">
            <LockKeyhole size={13} />
            {user
              ? t('Account connected · Mock payment')
              : t('Sign in to continue · Mock payment')}
          </p>
        </Summary>
      </div>
    </div>
  )
}
