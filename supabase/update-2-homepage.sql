-- =========================================================
-- TREDO — Update 2: Category photos, Banners, Video section
-- SQL Editor → New query → paste → Run (ekbar)
-- =========================================================

-- Category: own photo + show/hide
alter table categories add column if not exists image_url text;
alter table categories add column if not exists is_active boolean not null default true;

-- Banners: hero slider + promo banners (admin theke control)
create table if not exists banners (
  id           serial primary key,
  placement    text not null default 'hero' check (placement in ('hero','promo')),
  title        text,
  subtitle     text,
  button_text  text default 'Shop Now',
  link         text default '/shop',
  image_url    text,           -- desktop / main photo
  mobile_image_url text,       -- optional: phone er jonno alada photo
  dark_text    boolean not null default false,  -- true = kalo lekha (light photo hole)
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Videos: footer er age "Trending" reels
create table if not exists videos (
  id          serial primary key,
  video_url   text not null,
  poster_url  text,
  title       text,
  product_id  bigint references products(id) on delete set null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table banners enable row level security;
alter table videos  enable row level security;

-- server key access (same as before)
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- bigger uploads for videos (50 MB = Supabase free max)
update storage.buckets set file_size_limit = 52428800 where id = 'products';
