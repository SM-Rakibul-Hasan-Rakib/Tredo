-- =========================================================
-- SoleBD — Supabase database schema
-- Supabase Dashboard → SQL Editor → New query → paste → Run
-- =========================================================

-- 1) CATEGORIES (Nike Air Force, Jordan, Adidas ...)
create table if not exists categories (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- 2) PRODUCTS
--   stock = { "40": 3, "41": 5, ... }  (size-wise stock)
--   buy_price = HIDDEN — never sent to the website/reseller
create table if not exists products (
  id              bigserial primary key,
  name            text not null,
  slug            text not null unique,
  category_id     int references categories(id) on delete set null,
  description     text,
  buy_price       numeric(10,2) not null default 0,
  sell_price      numeric(10,2) not null,
  compare_price   numeric(10,2),
  reseller_price  numeric(10,2),
  stock           jsonb not null default '{}'::jsonb,
  images          text[] not null default '{}',
  tag             text check (tag in ('HOT','NEW') or tag is null),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_active_idx on products(is_active, created_at desc);

-- 3) RESELLERS (each reseller gets a login)
create table if not exists resellers (
  id           serial primary key,
  user_id      uuid unique references auth.users(id) on delete set null,
  name         text not null,
  phone        text,
  payment_info text,
  created_at   timestamptz not null default now()
);

-- 4) PROFILES — who is admin / reseller
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('admin','reseller')),
  reseller_id  int references resellers(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- 5) ORDERS (Website / Messenger / WhatsApp / Reseller)
create table if not exists orders (
  id               bigserial primary key,
  created_at       timestamptz not null default now(),
  source           text not null default 'Website'
                   check (source in ('Website','Messenger','WhatsApp','Reseller','Other')),
  status           text not null default 'Pending'
                   check (status in ('Pending','Confirmed','Shipped','Delivered','Returned','Cancelled')),
  customer_name    text not null,
  phone            text not null,
  address          text,
  zone             text not null default 'Inside Dhaka',
  delivery_charge  numeric(10,2) not null default 0,  -- customer pays
  courier_cost     numeric(10,2) not null default 0,  -- HIDDEN: you pay courier
  courier_name     text,
  tracking_code    text,
  packaging_cost   numeric(10,2) not null default 0,  -- HIDDEN
  discount         numeric(10,2) not null default 0,
  advance          numeric(10,2) not null default 0,
  reseller_id      int references resellers(id) on delete set null,
  note             text
);
create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_reseller_idx on orders(reseller_id);

-- 6) ORDER ITEMS (prices are copied at order time, so later price changes don't break old profit)
create table if not exists order_items (
  id                   bigserial primary key,
  order_id             bigint not null references orders(id) on delete cascade,
  product_id           bigint references products(id) on delete set null,
  product_name         text not null,
  size                 text not null,
  qty                  int not null check (qty > 0),
  unit_price           numeric(10,2) not null,   -- customer price
  unit_buy_price       numeric(10,2) not null,   -- HIDDEN
  unit_reseller_price  numeric(10,2)             -- reseller's cost (if reseller order)
);
create index if not exists order_items_order_idx on order_items(order_id);

-- 7) EXPENSES (FB ads, boost, packaging, hidden cost ...)
create table if not exists expenses (
  id         bigserial primary key,
  date       date not null default current_date,
  category   text not null,
  amount     numeric(10,2) not null,
  note       text,
  created_at timestamptz not null default now()
);

-- 8) RESELLER PAYOUTS
create table if not exists reseller_payouts (
  id           bigserial primary key,
  reseller_id  int not null references resellers(id) on delete cascade,
  amount       numeric(10,2) not null,
  note         text,
  created_at   timestamptz not null default now()
);

-- 9) Safe stock update (size-wise)
create or replace function change_stock(p_id bigint, p_size text, p_delta int)
returns void language sql as $$
  update products
     set stock = jsonb_set(stock, array[p_size],
                 to_jsonb(greatest(0, coalesce((stock->>p_size)::int, 0) + p_delta)))
   where id = p_id;
$$;

-- 10) SECURITY: turn on Row Level Security with NO public policies.
--     Website never talks to the DB from the browser — only the Next.js server
--     (with the secret service-role key) can read/write. So buy price etc. stay hidden.
alter table categories       enable row level security;
alter table products         enable row level security;
alter table resellers        enable row level security;
alter table profiles         enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table expenses         enable row level security;
alter table reseller_payouts enable row level security;


-- 10b) Newer Supabase projects don't auto-grant table access to API roles.
--      Only the SERVER key (service_role) gets access — browser keys (anon) get nothing.
grant usage on schema public to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- 11) Storage bucket for product photos (public read)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 12) Starter categories
insert into categories (name, slug, sort_order) values
  ('Nike Air Force 1', 'air-force', 1),
  ('Jordan',           'jordan',    2),
  ('Adidas',           'adidas',    3),
  ('New Balance',      'new-balance', 4),
  ('Running',          'running',   5),
  ('Converse & Vans',  'others',    6)
on conflict (slug) do nothing;
