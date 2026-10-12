import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { ArrowRight, PackageOpen, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export function Loading({
  label = 'Loading the good things…',
}: {
  label?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {t(label)}
    </div>
  )
}
export function ErrorState({
  message,
  retry,
}: {
  message: string
  retry?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="error-state" role="alert">
      <p>{t(message)}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw size={16} />
          {t('Try again')}
        </Button>
      )}
    </div>
  )
}
export function Empty({
  title,
  description,
  action = 'Explore the collection',
}: {
  title: string
  description: string
  action?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="empty-state">
      <PackageOpen size={40} strokeWidth={1} />
      <h1>{t(title)}</h1>
      <p>{t(description)}</p>
      <Button asChild>
        <Link
          to="/products"
          search={{
            q: '',
            category: 'all',
            price: 'all',
            sort: 'featured',
            page: 1,
          }}
        >
          {t(action)}
          <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  )
}
