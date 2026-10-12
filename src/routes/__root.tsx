import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from '../components/ui/sonner'
import { Shell } from '../components/shell'
import { Empty, ErrorState } from '../components/states'

export const Route = createRootRoute({
  component: () => (
    <>
      <Shell />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  ),
  notFoundComponent: () => (
    <Empty
      title="A little off the beaten path."
      description="This page isn't in our collection. Let's find your way back."
    />
  ),
  errorComponent: ({ reset }) => (
    <ErrorState
      message="This page could not be opened. Please try again."
      retry={reset}
    />
  ),
})
