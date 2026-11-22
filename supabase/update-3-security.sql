-- =========================================================
-- TREDO — Update 3: Database security tightening  (NEEDS YOUR APPROVAL BEFORE RUNNING)
-- Safe: no data is changed or deleted. Only WHO may touch the tables.
-- =========================================================

-- 1) Browser keys (anon / logged-in users) get NO direct table access.
--    The website never reads tables from the browser — only the server (service_role) does.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- 2) Stock function: only the server may call it (functions are public by default in Postgres)
revoke execute on function change_stock(bigint, text, int) from public, anon, authenticated;
grant  execute on function change_stock(bigint, text, int) to service_role;

-- 3) RLS stays ON for every table (re-run is harmless)
alter table categories       enable row level security;
alter table products         enable row level security;
alter table resellers        enable row level security;
alter table profiles         enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table expenses         enable row level security;
alter table reseller_payouts enable row level security;
alter table banners          enable row level security;
alter table videos           enable row level security;

-- 4) CHECK (read-only): run this after — every row should say rls = true, anon_can_select = false
select c.relname as table, c.relrowsecurity as rls,
       has_table_privilege('anon', c.oid, 'select') as anon_can_select
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
