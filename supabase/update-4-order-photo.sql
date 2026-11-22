-- =========================================================
-- TREDO — Update 4: Order photo
-- SQL Editor → New query → paste → Run (ekbar)
-- Safe: shudhu notun column add hoy, kono data bodlay na.
-- =========================================================
alter table orders add column if not exists image_url text;
