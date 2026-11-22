# TREDO — Sneaker Shop (Next.js + Supabase)

Website + Admin Panel + Reseller Panel. Shob kichu ekta project e.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres database + Login + Photo storage) · Tailwind CSS · Vercel (hosting)

**Keno fast:** website er page gula server e age thekei toiri (prerender) ar cache kora thake. Admin theke product add ba edit korle shudhu oi cache update hoy (`updateTag('products')`). Photo upload er age browser e choto (WebP) kora hoy, ar `next/image` mobile er jonno choto size dey. Customer er browser kokhono direct database e jay na.

---

## 0) Ki ki lagbe (ekbar install)

1. **Node.js 20 or newer (LTS)** → https://nodejs.org → download → install
2. **VS Code** → https://code.visualstudio.com
3. **Git** → https://git-scm.com
4. Account khulo (free): **GitHub**, **Supabase** (https://supabase.com), **Vercel** (https://vercel.com)

Check: terminal e `node -v` likhle v20+ dekhabe.

---

## 1) Project open koro

```bash
# zip unzip kore folder e jao
cd solebd
npm install
```

---

## 2) Database banao (Supabase)

1. supabase.com → **New project**
   - Name: `solebd`
   - Database password: strong ekta dao, kothao likhe rakho
   - **Region: Southeast Asia (Singapore)** ← Bangladesh er shobcheye kache, tai fast
2. Project ready hole → bam menu **SQL Editor** → **New query**
3. `supabase/schema.sql` file er puro lekha copy → paste → **Run**
   → ekhon tables, photo bucket ar 6 ta category (Air Force, Jordan, Adidas, New Balance, Running, Converse & Vans) toiri hoye gelo ✅

### Keys copy koro
**Project Settings → API** (ba "API Keys") theke:
- Project URL
- `anon` / publishable key
- `service_role` / secret key ⚠️ (eta **kauke dekhabe na**)

Project folder e `.env.example` copy kore nam dao **`.env.local`**, tarpor bhoro:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      ← secret
NEXT_PUBLIC_SHOP_NAME=SOLE BD
NEXT_PUBLIC_MESSENGER_URL=https://m.me/tomar-page
NEXT_PUBLIC_WHATSAPP_NUMBER=88017XXXXXXXX
NEXT_PUBLIC_PHONE=017XXXXXXXX
```

---

## 3) Nijeke Admin banao

1. Supabase → **Authentication → Users → Add user → Create new user**
   - email + password dao, **Auto Confirm User** ✅
2. User er **UID** copy koro (lomba id, jemon `3f2a...`)
3. SQL Editor e run koro (UID bodle):

```sql
insert into profiles (id, role) values ('PASTE-UID-HERE', 'admin');
```

---

## 4) Computer e chalao

```bash
npm run dev
```

- Website: http://localhost:3000
- Admin login: http://localhost:3000/login → tomar email/password → **/admin** e niye jabe

### Prothom product add koro
Admin → **Products & Stock → + Add Product**
- Nam, category, badge (HOT/NEW)
- 🔒 Buy price (website e dekhabe na), selling price, purono price (kete dekhano), reseller price
- **Size-wise stock** (39–45 default, size add/remove kora jay)
- **Photos** (onek gula; prothom ta main photo)
- **Save** → website e sathe sathe chole ashbe ⚡

---

## 5) Online e tolo (Vercel)

1. GitHub e notun **private** repo banao → project push koro:
   ```bash
   git add -A
   git commit -m "first version"
   git remote add origin https://github.com/TOMAR-NAME/solebd.git
   git push -u origin main
   ```
   (`.env.local` push hobe na, `.gitignore` e ache, eta thik ache)
2. vercel.com → **Add New → Project** → GitHub repo select
3. **Environment Variables** e `.env.local` er shob line add koro
4. **Deploy** → `solebd.vercel.app` type link pabe 🎉
5. `vercel.json` e region `sin1` (Singapore) set kora ache, tai server ar database kachakachi thake. Tai fast.

### Nijer domain (.com / .com.bd)
Domain kino (Namecheap, ba BD er kono provider) → Vercel → Project → **Settings → Domains** → add → je DNS record dekhabe, oita domain provider e boshao.

---

## 5.5) Update 2 — Banner, Brand photo, Video, Mobile App

1. Supabase SQL Editor e `supabase/update-2-homepage.sql` **ekbar Run** koro
2. `.env.local` e `NEXT_PUBLIC_SHOP_NAME=TREDO` jog koro (optional)
3. Admin e notun menu **Website**:
   - **Categories / Brands** → notun brand (jemon Travis Scott) add, brand photo dao → menu, filter, "Shop by Brand" e auto
   - **Banners** → Hero slider (desktop + mobile photo alada) ar Promo banner (joto khushi)
   - **Videos** → reels upload (MP4, 9:16, 50MB er kom), product link → footer er age "Trending at TREDO"
4. **Mobile App:** phone e website kholo → footer e **Install App** (Android) / Safari → Share → **Add to Home Screen** (iPhone).
   Admin panel o alada app hishebe install hoy: phone e `/admin` khule side menu er **Install App**.

## 6) Daily kaj

| Kaj | Kothay |
|---|---|
| Messenger/WhatsApp order entry | Admin → **New Order** (message paste korle phone/zone auto) |
| Order status change | Admin → **Orders** → dropdown (Cancel/Return korle stock auto fere ashe) |
| Courier cost, tracking ID | Order e click → edit |
| FB ads, boost, packaging khoroch | Admin → **Marketing & Expenses** |
| Asol profit dekha | **Dashboard** / **Profit Report** |
| Reseller add (login soho) | Admin → **Resellers** → form |
| Reseller payment | Resellers → **Mark paid** |

**Reseller** `/login` diye dhukbe → nijer catalog (shudhu reseller price dekhbe, tomar buy price na), order dite parbe, nijer profit ar payout dekhbe.

---

## 7) Kothay ki bodlabo

| Ki | File |
|---|---|
| Delivery charge (70/130) & courier cost | `src/lib/format.ts` → `DELIVERY` |
| Hero slider er lekha | `src/app/(store)/page.tsx` |
| Top bar / footer lekha | `src/components/store/header.tsx`, `footer.tsx` |
| Rong (blue, red) & font | `src/app/globals.css` → `@theme` |
| Expense category | `src/lib/types.ts` → `EXPENSE_CATS` |
| Notun category | Supabase → Table editor → `categories` → Insert row |

---

## 8) Folder map

```
supabase/schema.sql          ← database (ekbar run)
src/proxy.ts                 ← /admin & /reseller e login chara dhukte dey na
src/lib/
  data.ts                    ← website er data (cached = fast)
  admin-data.ts              ← admin er data
  orders.ts                  ← shob order ekhane toiri hoy (dam DB theke ney, stock kome)
  profit.ts                  ← profit er hisab
  auth.ts                    ← ke admin, ke reseller
src/app/(store)/             ← WEBSITE: home, shop, product, checkout
src/app/admin/               ← ADMIN PANEL
src/app/reseller/            ← RESELLER PANEL
src/app/actions/             ← form submit (server e chole)
src/components/              ← UI parts
```

---

## 9) Security (important)

- `SUPABASE_SERVICE_ROLE_KEY` **kokhono** GitHub, chat ba kono client side code e dibe na.
- Database er shob table e RLS on, ar public access er kono policy nai. Tai browser theke keu data churi korte parbe na. Shob data access Next.js server diye hoy.
- Website e dam database theke ney. Keu browser e dam bodle dileo order e asol dam boshbe.
- Admin page ar action gula protibar `requireAdmin()` diye check kore.

## 10) Free plan niye

- **Supabase Free:** prayi 500 MB database ar 1 GB photo storage. Ek shoptaho kono activity na thakle project **pause** hoye jay. Dashboard theke abar chalu kora jay. Shop e regular order ashle activity thakbe.
- **Vercel Hobby (free):** personal/non-commercial kajer jonno. Shuru te testing er jonno free te chalao. Business purapuri chalu hole Vercel er fair use rules dekhe Pro ($20/month) nite paro.

## 11) Problem hole

### ⭐ Website e kono data dekhay na? → **http://localhost:3000/setup-check** kholo
Ei page 8 ta jinish check kore (keys, database, tables, products, photo bucket, admin) ar je ta vul seta thik korar upay bole dey.
Terminal e `❌ Supabase error:` lekha thakle oikhane o karon ta dekha jabe.

Test data lagle: SQL Editor e `supabase/sample-data.sql` run koro → 12 ta sample product chole ashbe.


| Problem | Solution |
|---|---|
| `Supabase env missing` | `.env.local` ache kina, nam thik kina dekho, tarpor `npm run dev` abar chalao |
| Login hoy kintu "access nai" | Step 3 er `profiles` insert koro nai |
| Photo upload fail | `schema.sql` er storage bucket part run hoyeche kina dekho |
| Product edit korar por website e notun ta ashe na | Hard refresh (Ctrl+Shift+R). Normally sathe sathe update hoy |

### Porer step (optional)
- Courier API (Steadfast/Pathao) diye auto parcel booking
- bKash payment gateway
- Customer ke SMS e order confirm
- Facebook Pixel / Conversion API (ads er result track korte)
#   T r e d o  
 