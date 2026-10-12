import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Leaf,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { categories, defaultSearch } from '../lib/catalog'
import { LanguageSwitcher } from './language-switcher'

export function Shell() {
  const { t } = useTranslation()

  const cart = useCart()
  const auth = useAuth()
  const [menu, setMenu] = useState(false)
  const [info, setInfo] = useState<'story' | 'shipping' | null>(null)
  const path = useRouterState({ select: (s) => s.location.pathname })
  const nav = (
    <>
      <Link
        to="/products"
        search={defaultSearch}
        onClick={() => setMenu(false)}
      >
        {t('Shop all')}
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to="/products"
          search={{
            ...defaultSearch,
            category: c.id as 'home' | 'kitchen' | 'carry',
          }}
          onClick={() => setMenu(false)}
        >
          {t(c.name)}
        </Link>
      ))}
      <button
        onClick={() => {
          setMenu(false)
          setInfo('story')
        }}
      >
        {t('Our philosophy')}
      </button>
    </>
  )
  return (
    <>
      <a href="#main" className="skip-link">
        {t('Skip to content')}
      </a>
      <div className="announcement">
        {t('A little more joy in your everyday.')}
        <span>{t('Free US shipping on orders $75+')}</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <div className="mobile-menu">
            <Sheet open={menu} onOpenChange={setMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('Open menu')}>
                  <Menu size={21} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Everyday Edit</SheetTitle>
                  <SheetDescription>
                    {t('Good things for everyday living.')}
                  </SheetDescription>
                </SheetHeader>
                <nav className="mobile-nav" aria-label={t('Mobile navigation')}>
                  {nav}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="brand" aria-label={t('Everyday Edit home')}>
            <span className="brand-mark">
              <Leaf size={25} strokeWidth={1.4} />
            </span>
            everyday edit<span className="brand-period">.</span>
          </Link>
          <nav className="desktop-nav" aria-label={t('Main navigation')}>
            {nav}
          </nav>
          <div className="header-actions">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" asChild>
              <Link
                className="header-search"
                to="/products"
                search={defaultSearch}
                aria-label={t('Search products')}
              >
                <Search size={20} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link
                to={auth.user ? '/orders' : '/auth'}
                aria-label={
                  auth.user ? t('Your account and orders') : t('Sign in')
                }
              >
                <UserRound size={20} />
              </Link>
            </Button>
            <Link
              to="/cart"
              className="bag-link"
              aria-label={t('Shopping bag, {{count}} items', {
                count: cart.count,
              })}
            >
              <ShoppingBag size={20} />
              <span className="bag-count">{cart.count}</span>
            </Link>
          </div>
        </div>
      </header>
      <main id="main" key={path} tabIndex={-1}>
        <Outlet />
      </main>
      <div className="benefits wrap">
        <div>
          <Truck size={23} />
          <span>
            {t('Free shipping over $75')}
            <small>{t('Good things, delivered to your door.')}</small>
          </span>
        </div>
        <div>
          <RotateCcw size={23} />
          <span>
            {t('Room to change your mind')}
            <small>{t('A 30-day return policy in our demo store.')}</small>
          </span>
        </div>
        <div>
          <Leaf size={23} />
          <span>
            {t('Chosen with intention')}
            <small>{t('Fewer things. More everyday joy.')}</small>
          </span>
        </div>
      </div>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <Link className="brand" to="/">
              everyday edit.
            </Link>
            <p>
              {t('Thoughtful objects.')}
              <br />
              {t('A more considered everyday.')}
            </p>
            <span className="footer-note">
              {t('An independent collection of good things.')}
            </span>
          </div>
          <div>
            <h2>{t('Make yourself at home')}</h2>
            <Link to="/products" search={defaultSearch}>
              {t('Shop the collection')}
            </Link>
            <Link to="/orders">{t('Your orders')}</Link>
            <button onClick={() => setInfo('shipping')}>
              {t('Shipping & returns')}
            </button>
            <button onClick={() => setInfo('story')}>
              {t('Our philosophy')}
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="footer-message">
            <h2>{t('Small things, better days.')}</h2>
            <p>
              {t('Objects you reach for. Details you notice.')}
              <br />
              {t('Made for the moments in between.')}
            </p>
            <div className="currency">{t('United States · USD $')}</div>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} Everyday Edit</span>
          <span>{t('Demo store · All payments are simulated')}</span>
          {auth.user && (
            <button
              onClick={() =>
                void auth
                  .signOut()
                  .then(() => toast.success(t('Signed out')))
                  .catch(() => toast.error(t('Sign out failed. Please retry.')))
              }
            >
              {t('Sign out')}
            </button>
          )}
        </div>
      </footer>
      <Dialog
        open={!!info}
        onOpenChange={(open) => {
          if (!open) setInfo(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {info === 'story'
                ? t('A little more considered.')
                : t('Good things, delivered.')}
            </DialogTitle>
            <DialogDescription>
              {info === 'story'
                ? t(
                    'We believe the things you use every day deserve a little thought. Everyday Edit brings together useful objects with quiet character, for home and wherever the day takes you. This is a demonstration store; products and orders are for testing.',
                  )
                : t(
                    'Our demo uses US delivery: $6.99 flat rate, free on merchandise orders of $75 or more. Tax is a demo value of $0. A 30-day return policy is shown for presentation only. No parcels are shipped and no money is charged.',
                  )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
