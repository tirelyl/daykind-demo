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
  const cart = useCart()
  const { user } = useAuth()
  if (cart.loading) return <Loading label="Opening your bag…" />
  if (cart.error)
    return (
      <div className="wrap section">
        <ErrorState message={cart.error} retry={cart.retry} />
      </div>
    )
  if (!cart.lines.length)
    return (
      <Empty
        title="Your bag has room for good things."
        description="Find something that makes your everyday a little better."
      />
    )
  return (
    <div className="wrap section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Your everyday, in the making</p>
          <h1>
            Your bag <span className="heading-count">({cart.count})</span>
          </h1>
        </div>
        <Link className="text-link" to="/products" search={defaultSearch}>
          <ArrowLeft size={16} />
          Keep exploring
        </Link>
      </div>
      <div className="cart-layout">
        <div>
          <div className="bag-heading">
            <span>The good things</span>
            <span>Total</span>
          </div>
          {cart.lines.map((line) => (
            <BagLine key={line.sku} line={line} />
          ))}
          <p className="cart-persistence">
            {user
              ? 'Your bag is saved to your account.'
              : 'Your bag is saved on this device. Sign in at checkout to keep it with you.'}
          </p>
        </div>
        <Summary>
          <Button asChild size="lg" className="full-width">
            <Link
              to={user ? '/checkout' : '/auth'}
              search={user ? undefined : { redirect: '/checkout' }}
            >
              Continue to checkout
              <ArrowRight size={17} />
            </Link>
          </Button>
          <p className="secure-note">
            <LockKeyhole size={13} />
            {user
              ? 'Account connected · Mock payment'
              : 'Sign in to continue · Mock payment'}
          </p>
        </Summary>
      </div>
    </div>
  )
}
