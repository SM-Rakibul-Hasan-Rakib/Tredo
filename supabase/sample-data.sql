-- =========================================================
-- OPTIONAL: test er jonno 12 ta sample product
-- (schema.sql run korar POR eta run koro)
-- Photo nai — pore Admin → Products → Edit e photo add koro,
-- ba eigula delete kore nijer product dao.
-- =========================================================
insert into products (name, slug, category_id, buy_price, sell_price, compare_price, reseller_price, tag, stock) values
('Nike Air Force 1 ''07 Triple White', 'af1-triple-white',  (select id from categories where slug='air-force'),   1650, 2850, 3500, 2300, 'HOT', '{"40":4,"41":5,"42":6,"43":4,"44":3,"45":2}'),
('Air Force 1 Triple Black',           'af1-triple-black',  (select id from categories where slug='air-force'),   1650, 2850, 3400, 2300, null,  '{"40":3,"41":3,"42":4,"43":3,"44":2,"45":1}'),
('Jordan 1 Retro High Chicago',        'jordan-1-chicago',  (select id from categories where slug='jordan'),      2200, 3650, 4500, 3000, 'HOT', '{"40":2,"41":2,"42":2,"43":2,"44":1,"45":0}'),
('Jordan 4 Military Black',            'jordan-4-military', (select id from categories where slug='jordan'),      2600, 4250, 5200, 3550, 'NEW', '{"40":1,"41":1,"42":1,"43":1,"44":1,"45":0}'),
('Jordan 1 Low Panda',                 'jordan-1-low-panda',(select id from categories where slug='jordan'),      1900, 3150, 3800, 2650, null,  '{"39":2,"40":2,"41":2,"42":2,"43":2,"44":1,"45":1}'),
('Adidas Samba OG Black',              'samba-og-black',    (select id from categories where slug='adidas'),      1800, 3150, 3800, 2600, 'HOT', '{"39":2,"40":3,"41":3,"42":3,"43":2,"44":1,"45":0}'),
('Adidas Campus 00s Grey',             'campus-00s-grey',   (select id from categories where slug='adidas'),      1750, 2950, 3600, 2450, 'NEW', '{"39":2,"40":2,"41":2,"42":2,"43":1,"44":1,"45":0}'),
('New Balance 550 White Green',        'nb-550-white-green',(select id from categories where slug='new-balance'), 1900, 3250, 3900, 2700, null,  '{"40":1,"41":1,"42":1,"43":1,"44":0,"45":0}'),
('New Balance 9060 Sea Salt',          'nb-9060-sea-salt',  (select id from categories where slug='new-balance'), 2400, 3950, 4700, 3300, 'HOT', '{"40":1,"41":1,"42":1,"43":0,"44":0,"45":0}'),
('Nike Air Max 97 Silver',             'air-max-97-silver', (select id from categories where slug='running'),     2100, 3450, 4200, 2850, null,  '{"40":1,"41":2,"42":2,"43":1,"44":1,"45":0}'),
('Adidas Ultraboost Triple Black',     'ultraboost-black',  (select id from categories where slug='running'),     2000, 3350, 4000, 2800, null,  '{"40":2,"41":2,"42":2,"43":2,"44":1,"45":0}'),
('Converse Chuck 70 Black',            'chuck-70-black',    (select id from categories where slug='others'),      1100, 1950, 2500, 1600, null,  '{"38":4,"39":5,"40":5,"41":5,"42":5,"43":4,"44":2}')
on conflict (slug) do nothing;
