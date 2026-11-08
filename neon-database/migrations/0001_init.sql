-- 0001_init.sql
-- Run this by hand against Neon (SQL editor or psql). Nothing in the app
-- runs migrations automatically. After running it, keep src/lib/db/schema.ts
-- in sync by hand.

create table if not exists products (
  id                      text primary key,
  name                    text not null,
  brand                   text not null,
  category                text not null,
  description             text not null,
  price_ugx               integer not null,
  discount_price_ugx      integer,
  images                  jsonb not null default '[]',
  specs                   jsonb not null default '{}',
  metrics                 jsonb not null default '{}',
  condition               text not null default 'New',
  warranty                text,
  stock                   integer not null default 0,
  availability            text not null default 'in_stock',
  compatible_accessories  jsonb not null default '[]',
  use_cases               jsonb not null default '[]',
  keywords                jsonb not null default '[]',
  featured                boolean not null default false,
  sample                  boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists delivery_zones (
  id       text primary key,
  name     text not null,
  fee_ugx  integer
);

create table if not exists payment_methods (
  id       text primary key,
  label    text not null,
  enabled  boolean not null default false,
  note     text
);

create table if not exists orders (
  id                   text primary key,
  status               text not null default 'new',
  payment_status       text not null default 'unpaid',
  customer_name        text not null,
  customer_phone       text not null,
  customer_address     text,
  customer_notes       text,
  zone_id              text not null references delivery_zones(id),
  delivery_fee_ugx     integer,
  fee_confirmed        boolean not null default false,
  payment_method_id    text not null references payment_methods(id),
  lines                jsonb not null,
  subtotal_ugx         integer not null,
  total_ugx            integer not null,
  created_at           timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(featured) where featured = true;
create index if not exists idx_orders_zone on orders(zone_id);
