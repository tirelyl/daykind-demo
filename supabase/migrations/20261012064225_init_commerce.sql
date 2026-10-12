create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  sku text not null,
  quantity integer not null check (quantity between 1 and 99),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, sku)
);
create function public.touch_cart() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end;
$$;
create trigger touch_cart before update on public.cart_items for each row execute function public.touch_cart();
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('confirmed', 'payment_failed')),
  payment_status text not null check (payment_status in ('succeeded', 'failed')),
  payment_mode text not null default 'mock' check (payment_mode = 'mock'),
  currency text not null default 'USD' check (currency = 'USD'),
  subtotal integer not null check (subtotal > 0),
  shipping integer not null check (shipping >= 0),
  tax integer not null default 0 check (tax = 0),
  total integer not null check (total = subtotal + shipping + tax),
  address jsonb not null,
  idempotency_key uuid not null,
  request_hash text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  check ((status = 'confirmed' and payment_status = 'succeeded') or (status = 'payment_failed' and payment_status = 'failed'))
);
create index orders_user_created on public.orders(user_id, created_at desc);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null, sku text not null, name text not null, image text not null, variant text not null,
  unit_price integer not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 99)
);
create index order_items_order on public.order_items(order_id);
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.cart_items, public.orders, public.order_items from anon, authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant all on public.cart_items, public.orders, public.order_items to service_role;
create policy own_cart on public.cart_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_orders on public.orders for select to authenticated using ((select auth.uid()) = user_id);
create policy own_order_items on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
-- RLS remains active; the merge is atomic and keeps the larger quantity for each SKU.
create function public.merge_guest_cart(items jsonb) returns void language plpgsql security invoker set search_path = '' as $$
declare item jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if jsonb_array_length(items) > 100 then raise exception 'Too many items'; end if;
  for item in select value from jsonb_array_elements(items) loop
    insert into public.cart_items (user_id, product_id, sku, quantity)
    values (auth.uid(), item->>'product_id', item->>'sku', (item->>'quantity')::integer)
    on conflict (user_id, sku) do update set quantity = greatest(public.cart_items.quantity, excluded.quantity);
  end loop;
end;
$$;
revoke all on function public.merge_guest_cart(jsonb) from public, anon;
grant execute on function public.merge_guest_cart(jsonb) to authenticated;
-- Only the Edge Function supplies trusted prices. All changes commit together.
create function public.commit_checkout(p_user uuid, p_key uuid, p_hash text, p_address jsonb, p_items jsonb, p_expected jsonb, p_success boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare existing public.orders; item jsonb; cart_row public.cart_items; new_id uuid; sub integer := 0; ship integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  select * into existing from public.orders where user_id = p_user and idempotency_key = p_key;
  if found then
    if existing.request_hash <> p_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('order_id', existing.id, 'payment_status', existing.payment_status);
  end if;
  if jsonb_array_length(p_expected) = 0 or jsonb_array_length(p_expected) <> jsonb_array_length(p_items) then raise exception 'EMPTY_CART'; end if;
  for item in select value from jsonb_array_elements(p_expected) order by value->>'sku' loop
    select * into cart_row from public.cart_items where user_id = p_user and sku = item->>'sku' for update;
    if not found or cart_row.updated_at <> (item->>'updated_at')::timestamptz or cart_row.quantity <> (item->>'quantity')::integer or cart_row.product_id <> item->>'product_id' then raise exception 'CART_CHANGED'; end if;
  end loop;
  for item in select value from jsonb_array_elements(p_items) loop
    sub := sub + (item->>'unit_price')::integer * (item->>'quantity')::integer;
  end loop;
  ship := case when sub >= 7500 then 0 else 699 end;
  insert into public.orders(user_id,status,payment_status,subtotal,shipping,total,address,idempotency_key,request_hash)
  values(p_user,case when p_success then 'confirmed' else 'payment_failed' end,case when p_success then 'succeeded' else 'failed' end,sub,ship,sub+ship,p_address,p_key,p_hash) returning id into new_id;
  insert into public.order_items(order_id,product_id,sku,name,image,variant,unit_price,quantity)
  select new_id,x.product_id,x.sku,x.name,x.image,x.variant,x.unit_price,x.quantity
  from jsonb_to_recordset(p_items) as x(product_id text,sku text,name text,image text,variant text,unit_price integer,quantity integer);
  if p_success then
    delete from public.cart_items where user_id = p_user and sku in (select value->>'sku' from jsonb_array_elements(p_expected));
  end if;
  return jsonb_build_object('order_id',new_id,'payment_status',case when p_success then 'succeeded' else 'failed' end);
end;
$$;
revoke all on function public.commit_checkout(uuid,uuid,text,jsonb,jsonb,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.commit_checkout(uuid,uuid,text,jsonb,jsonb,jsonb,boolean) to service_role;
