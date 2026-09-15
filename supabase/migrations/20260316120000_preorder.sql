-- Pre-order: sell out-of-stock products when products.allow_preorder is true.
-- Admin can turn allow_preorder off so OOS items are unavailable.

alter table public.products
  add column if not exists allow_preorder boolean not null default true;

comment on column public.products.allow_preorder is
  'When true and stock is 0, customers can still buy as a pre-order. When false, OOS blocks purchase.';

alter table public.order_items
  add column if not exists is_preorder boolean not null default false;

create index if not exists order_items_is_preorder_idx
  on public.order_items (is_preorder)
  where is_preorder = true;

-- Order-level status for admin boards (paid orders that include pre-order lines)
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'order_status' and e.enumlabel = 'pre_order'
  ) then
    alter type public.order_status add value 'pre_order' after 'paid';
  end if;
end $$;
