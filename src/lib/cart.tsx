import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import { supabase } from './supabase'
import { resolveLine, totals } from './catalog'
import type { CartLine } from './catalog'

const storageKey = 'ee-guest-cart'
function readGuest(): CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
    if (!Array.isArray(raw) || raw.length > 100) return []
    return raw.filter((line) => {
      try {
        resolveLine(line)
        return true
      } catch {
        return false
      }
    })
  } catch {
    return []
  }
}
function saveGuest(lines: CartLine[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(lines))
  } catch {
    toast.error('Your browser could not save this bag. Keep this tab open.')
  }
}
function useCartState() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [guest, setGuest] = useState<CartLine[]>(readGuest)
  const [mergeError, setMergeError] = useState('')
  const [merging, setMerging] = useState(false)
  const mergeOwner = useRef<string | null>(null)
  const key = ['user', user?.id, 'cart']
  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async ({ signal }) => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id,sku,quantity,updated_at')
        .eq('user_id', user!.id)
        .order('sku')
        .abortSignal(signal)
      if (error) throw error
      return data
    },
  })
  async function mergeGuest() {
    if (!user || merging) return
    const owner = user.id
    mergeOwner.current = owner
    const pending = readGuest()
    if (!pending.length) return
    setMerging(true)
    setMergeError('')
    try {
      await queryClient.cancelQueries({ queryKey: ['user', owner, 'cart'] })
      pending.forEach(resolveLine)
      const { error } = await supabase.rpc('merge_guest_cart', {
        items: pending,
      })
      if (error) throw error
      // Clear only after the database committed the entire merge.
      saveGuest([])
      setGuest([])
      await queryClient.invalidateQueries({ queryKey: ['user', owner, 'cart'] })
      toast.success('Your bag is saved to your account.')
    } catch {
      setMergeError(
        'We could not save your guest bag. Your items are still on this device. Retry before checking out.',
      )
    } finally {
      setMerging(false)
    }
  }
  useEffect(() => {
    if (user && mergeOwner.current !== user.id) void mergeGuest()
    if (!user) {
      mergeOwner.current = null
      setMergeError('')
    }
  }, [user?.id])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey) setGuest(readGuest())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const lines = user ? (query.data ?? []) : guest
  const mutation = useMutation({
    mutationFn: async ({
      line,
      quantity,
    }: {
      line: CartLine
      quantity: number
    }) => {
      if (quantity) resolveLine({ ...line, quantity })
      if (user) {
        const result =
          quantity === 0
            ? await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('sku', line.sku)
            : await supabase.from('cart_items').upsert(
                {
                  user_id: user.id,
                  product_id: line.product_id,
                  sku: line.sku,
                  quantity,
                },
                { onConflict: 'user_id,sku' },
              )
        if (result.error) throw result.error
        await queryClient.invalidateQueries({ queryKey: key })
      } else {
        const current = readGuest()
        const next =
          quantity === 0
            ? current.filter((item) => item.sku !== line.sku)
            : [
                ...current.filter((item) => item.sku !== line.sku),
                { product_id: line.product_id, sku: line.sku, quantity },
              ]
        saveGuest(next)
        setGuest(next)
      }
    },
    onError: (error) =>
      toast.error(
        error.message || 'Your bag could not be updated. Please retry.',
      ),
    onSuccess: (_data, { line, quantity }) => {
      if (quantity === 0)
        toast('Removed from your bag', {
          action: { label: 'Undo', onClick: () => update(line, line.quantity) },
        })
    },
  })
  function update(line: CartLine, quantity: number): void {
    mutation.mutate({ line, quantity })
  }
  async function add(line: CartLine) {
    const current = lines.find((item) => item.sku === line.sku)?.quantity ?? 0
    await mutation.mutateAsync({ line, quantity: current + line.quantity })
    toast.success('Added to your bag')
  }
  const subtotal = lines.reduce((sum, line) => {
    try {
      return sum + resolveLine(line).product.price * line.quantity
    } catch {
      return sum
    }
  }, 0)
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    totals: totals(subtotal),
    add,
    update,
    busy: mutation.isPending || merging,
    loading:
      authLoading || merging || (!!user && query.isPending && !mergeError),
    error:
      mergeError ||
      (query.error ? 'We could not load your saved bag. Please retry.' : ''),
    retry: () => {
      if (mergeError) void mergeGuest()
      else void query.refetch()
    },
  }
}
const CartContext = createContext<ReturnType<typeof useCartState> | null>(null)
export function CartProvider({ children }: { children: ReactNode }) {
  const state = useCartState()
  return <CartContext.Provider value={state}>{children}</CartContext.Provider>
}
export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('CartProvider missing')
  return cart
}
