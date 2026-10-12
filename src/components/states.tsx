import { Link } from '@tanstack/react-router'
import { ArrowRight, PackageOpen, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export function Loading({
  label = 'Loading the good things…',
}: {
  label?: string
}) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {label}
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
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw size={16} />
          Try again
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
  return (
    <div className="empty-state">
      <PackageOpen size={40} strokeWidth={1} />
      <h1>{title}</h1>
      <p>{description}</p>
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
          {action}
          <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  )
}
