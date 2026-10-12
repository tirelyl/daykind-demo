import { useQuery } from '@tanstack/react-query'
import { useAuth } from './auth'
import { supabase } from './supabase'
import type { Address } from './catalog'

export type OrderItem = {
  id: string
  product_id: string
  sku: string
  name: string
  image: string
  variant: string
  unit_price: number
  quantity: number
}
export type Order = {
  id: string
  status: 'confirmed' | 'payment_failed'
  payment_status: 'succeeded' | 'failed'
  payment_mode: 'mock'
  subtotal: number
  shipping: number
  tax: number
  total: number
  created_at: string
  address: Address
  order_items: OrderItem[]
}
export function useOrders(id?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user', user?.id, 'orders', id ?? 'all'],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*,order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (id) query = query.eq('id', id)
      const { data, error } = await query
      if (error) throw error
      return data as unknown as Order[]
    },
  })
}
