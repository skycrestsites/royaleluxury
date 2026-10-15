# Royale Luxury: Admin Backend Plan

This document describes the admin backend for royaleluxury.com: what it does, how it is built, how it is secured, and the steps the business owner needs to complete to take it live.

---

## 1. Goals

| Goal | How it is met |
| --- | --- |
| A private admin area at `/adminlogin` | Google or email sign-in, gated by server-issued admin roles |
| Manage products without code changes | Product editor with image uploads, pricing, variants, status |
| Manage categories (rooms) | Category editor with hero image and SEO copy |
| See orders with customer and shipping details | Orders list and order detail view, written only by the server |
| Invite other team members | Email invites through Resend with a one-time join link |
| See storage usage | Live counters for uploaded files and bytes |
| Connect other platforms later | Integrations panel showing Firebase, GitHub publishing, Resend and Stripe status |
| Fast public site with strong SEO | Static pages rebuilt on "Publish", product data pulled from Firestore at build time |

---

## 2. Architecture

```
                         ┌────────────────────────────────────────┐
  Shoppers ───────────▶  │  Firebase Hosting (static Astro site)  │
                         │  /, /shop, /collections/*, /products/* │
                         └───────────────▲────────────────────────┘
                                         │ deploys
                         ┌───────────────┴────────────────────────┐
                         │  GitHub Actions: build + deploy        │
                         │  reads active products from Firestore  │
                         └───────────────▲────────────────────────┘
                                         │ "Publish" (workflow_dispatch)
  Admins ─────▶ /adminlogin ─────▶ /admin/*  (React, loaded only on admin pages)
                     │                 │
                     ▼                 ▼
              Firebase Auth     Firestore + Cloud Storage  ◀── Security Rules
                     │                 ▲
                     ▼                 │
              Cloud Functions (server only: roles, invites, orders, publish, storage stats)
                     │
                     ├── Resend (invite emails)
                     ├── GitHub API (trigger site rebuild)
                     └── Stripe (checkout + webhooks, phase 2)
```

### Why this shape

- **Static storefront**: product pages are pre-rendered HTML, which is the fastest option on mobile and the best for SEO. Nothing about the admin ships to shoppers.
- **Publish button**: edits are saved instantly in the admin, and go live on the public site when an admin presses Publish (about one to two minutes).
- **Server-only privileges**: roles, invites, orders and integrations are handled in Cloud Functions with the Admin SDK. The browser never holds a secret.

---

## 3. Project structure

```
RoyaleLuxury/
├── docs/ADMIN_BACKEND_PLAN.md      ← this file
├── firebase.json                   Hosting, headers, emulators, rules wiring
├── .firebaserc                     Project alias (royaleluxury)
├── .env.emulators                  Points the local site and admin at the emulators
├── firestore.rules                 Database security rules
├── firestore.indexes.json          Composite indexes
├── storage.rules                   File upload security rules
├── seed/                           Sample catalog + sample orders
│   ├── catalog.json
│   └── orders.json
├── scripts/
│   ├── generate-brand-assets.mjs   Favicons and share image
│   ├── seed.mjs                    Loads sample data into Firestore + Storage
│   └── mark-published.mjs          Called by CI after a successful deploy
├── functions/                      Cloud Functions (TypeScript, Node 22)
│   ├── .env                        Non-secret production settings (owner email, site URL, sender)
│   └── src/
│       ├── index.ts                Exports every function
│       ├── config.ts               Params and secrets
│       ├── lib/                    Shared helpers (auth guard, admin SDK, email)
│       ├── team/                   claimOwner, inviteMember, acceptInvite, removeMember
│       ├── catalog/                Change tracking for the Publish button
│       ├── storage/                Storage usage counters
│       └── publish/                Triggers the GitHub deploy workflow
├── .github/workflows/deploy.yml    Build + deploy pipeline
└── src/
    ├── data/                       Catalog loader (seed or Firestore), site settings
    ├── admin/                      Admin app (React)
    │   ├── lib/                    Firebase client, auth, data access
    │   ├── components/             Shell, image manager, list editors, publish panel, UI kit
    │   └── pages/                  Login, Dashboard, Products, Categories, Orders, Team, Settings
    ├── layouts/AdminLayout.astro   Admin-only HTML shell (noindex)
    ├── pages/adminlogin.astro      /adminlogin/
    ├── pages/admin/                /admin/, /admin/products/, /admin/orders/ ...
    └── styles/admin.css            Admin styling
```

---

## 4. Data model (Firestore)

| Collection | Purpose | Who can read | Who can write |
| --- | --- | --- | --- |
| `products/{id}` | Catalog items | Public (active only), admins (all) | Admins (delete: owners) |
| `categories/{slug}` | Rooms (Bedroom, Kitchen, ...) | Public | Admins (delete: owners) |
| `orders/{id}` | Purchases with customer info | Admins | Server only (admins may update status, tracking, notes) |
| `admins/{uid}` | Team roster | Admins | Server only |
| `invites/{id}` | Pending team invites | Owners | Server only |
| `integrations/{id}` | Connection status of other platforms | Admins | Owners (status fields only) |
| `stats/storage` | Uploaded file count and bytes | Admins | Server only |
| `site/publish` | Last publish time and pending changes | Admins | Server only |

### Product document

```ts
{
  name, slug, sku, categoryId,
  status: 'draft' | 'active' | 'archived',
  price, compareAtPrice, currency,
  summary, description: string[], highlights: string[],
  details: { label, value }[], care: string[],
  sizes: string[], colors: { name, hex }[],
  images: { path, alt, width, height }[],   // files live in Cloud Storage
  badge, featured, inventory,
  rating, reviewCount, reviews: Review[],
  stripe: { productId, priceId } | null,     // filled in phase 2
  createdAt, updatedAt, updatedBy
}
```

### Order document

```ts
{
  number: 'RL-10001',
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  customer: { name, email, phone },
  shippingAddress: { line1, line2, city, region, postalCode, country },
  items: { productId, name, sku, size, color, quantity, unitPrice, image }[],
  totals: { subtotal, shipping, tax, total, currency },
  payment: { provider: 'stripe', sessionId, paymentIntentId, status },
  fulfillment: { carrier, trackingNumber, shippedAt },
  notes, createdAt, updatedAt
}
```

---

## 5. Security

Security is enforced on the server. The browser is treated as untrusted.

1. **Admin roles are custom claims.** Only Cloud Functions can grant `owner` or `admin`. Signing up on the login page gives no access on its own.
2. **Firestore and Storage rules** check the role on every read and write, validate field types, cap image size at 10 MB and only accept image files. Rules are stored on Google's servers and are never sent to the browser.
3. **Orders are server-written.** Shoppers cannot create or read orders. Customer addresses are visible only to admins.
4. **Secrets never reach the browser.** The Resend key, GitHub token and Stripe keys live in Google Secret Manager and are read only by Cloud Functions.
5. **Admin code is isolated.** The admin bundle loads only on `/admin*` pages, is minified, ships without source maps, and is marked `noindex` with `Cache-Control: no-store`.
6. **Security headers** on every response: Content Security Policy, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
7. **Invites** use a random 32-byte token, stored only as a SHA-256 hash, valid for 7 days and usable once. The invite is bound to the invited email address.
8. **Removing a team member** clears their role and revokes their sessions immediately.
9. **Roles:** owners can do everything. Admins manage products, categories and orders, but cannot invite or remove people, or delete products and categories.

These protections were tested against the emulators: anonymous visitors get `403` on orders, the team list and any write, while live products stay publicly readable. Invite links work once and only for the invited email.

> **Note on "hiding code":** any JavaScript a browser runs can be downloaded by that browser. That is true of every website. What matters is that nothing in it is sensitive. The Firebase web config (API key, project ID) is designed to be public and identifies the project only; all access is decided by the rules and functions above.

Phase 2 hardening: Firebase App Check (reCAPTCHA Enterprise) to block scripted traffic against the database and functions.

---

## 6. Admin features

| Page | URL | Features |
| --- | --- | --- |
| Login | `/adminlogin/` | Google sign-in, email and password, invite acceptance |
| Dashboard | `/admin/` | Revenue, order counts, product counts, recent orders, storage usage, publish status |
| Products | `/admin/products/` | Search, filter by status and category, create, edit, archive |
| Product editor | `/admin/products/edit/?id=` | Details, pricing, stock, sizes and colours, specifications, care, drag-and-drop photo upload with alt text and reordering, Stripe IDs, warns before leaving with unsaved changes |
| Categories | `/admin/categories/` | Create and edit rooms: name, headline, summary, search description, intro and cover photo |
| Orders | `/admin/orders/` | Filter by status, search by customer or order number |
| Order detail | `/admin/orders/view/?id=` | Customer, address, items, totals, update status, add tracking and notes |
| Team | `/admin/team/` | Invite by email, see pending invites, remove members (owners only) |
| Settings | `/admin/settings/` | Integrations, storage usage, publish site |

### How publishing works

1. Saving a product or category updates Firestore immediately, and the admin shows **Unpublished changes**.
2. **Publish storefront** (Dashboard or Settings) asks GitHub Actions to rebuild the site from Firestore and deploy it to Firebase Hosting. It takes about two minutes.
3. When the deploy finishes, the badge returns to **Up to date**. If the build fails it shows **Last publish failed**, and the live site keeps the previous version.

Pushing code to `main` also deploys. Until the `FIREBASE_SERVICE_ACCOUNT` secret exists, the workflow only builds and skips the deploy, so it never fails just because setup isn't finished.

### Storage usage

Every upload or delete recounts the files in the bucket, so the figure is always exact. **Recalculate** in Settings does the same on demand. Firebase includes 5 GB of storage on Blaze before charges start, and the meter is measured against that.

---

## 7. Phase 2: Stripe checkout

1. Create the Stripe account and add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as Firebase secrets.
2. Add a `createCheckoutSession` function: it reads prices from Firestore (never from the browser), so shoppers cannot change prices.
3. Add a `stripeWebhook` function: on `checkout.session.completed` it writes the order to `orders/` with the customer and shipping address Stripe collected.
4. Switch the bag page's Checkout button to call `createCheckoutSession`.
5. Optional: sync each product to a Stripe Product and Price and store the IDs in `product.stripe`.

The order schema above already matches what Stripe returns, so the admin Orders pages need no changes.

---

## 8. Local development

This works today without Blaze. Requirements: Node 22 or newer, and Java 11 or newer for the emulators.

```bash
npm install
npm --prefix functions install
npm run emulators        # terminal 1: builds functions, starts Auth, Firestore, Storage, Functions (UI on :4000)
npm run seed             # terminal 2: sample categories, 12 products with photos, 8 orders, a test owner
npm run dev:emulators    # terminal 2: site + admin at http://localhost:4321 using the emulators
```

Open `http://localhost:4321/adminlogin/` and sign in with the test owner the seed creates:

- Email: `netspirestudios@gmail.com`
- Password: `royale-dev-2026`

This account exists only in the local emulator. **Continue with Google** also works locally: the emulator shows a fake Google screen where you can type any email.

Emulator data resets when the emulators stop, so run `npm run seed` again after each restart. Locally, invite emails go through Resend using its test sender, which can only deliver to the email address on your Resend account. The invite link is always shown on screen so it can be copied.

---

## 9. Your checklist

These are the steps that need your account access. Do them in order.

### A. Firebase console (about 10 minutes)

1. **Upgrade to Blaze.** Firebase console → `RoyaleLuxury` → bottom left "Spark" → Upgrade. Then in Google Cloud Billing → Budgets, create a budget of $10/month with email alerts.
2. **Create the database.** Build → Firestore Database → Create database → **Production mode** → location **nam5 (United States)**.
3. **Turn on Storage.** Build → Storage → Get started → Production mode → same location.
4. **Turn on sign-in.** Build → Authentication → Get started → Sign-in method:
   - Enable **Google**, set the support email to `netspirestudios@gmail.com`.
   - Enable **Email/Password**.
   - Settings → User actions: untick **Enable create (sign-up)** if you want to block public sign-ups entirely (invites still work).
5. **Authorized domains.** Authentication → Settings → Authorized domains: add `royaleluxury.com` and `www.royaleluxury.com`.

### B. Resend (invite emails)

1. Resend → Domains → Add `royaleluxury.com` and add the DNS records it gives you at your domain registrar. Until the domain is verified, Resend can only send to your own Resend account email.
2. Invites are sent from `Royale Luxury <team@royaleluxury.com>`. To use a different address, change `EMAIL_FROM` in `functions/.env` before deploying. It must be on the verified domain.
3. The API key you sent is already wired into local testing (in a gitignored file, never committed). For production, store it as a secret (step D).
4. Because the key was shared in a chat, create a new key in Resend once everything is live and replace it with `firebase functions:secrets:set RESEND_API_KEY`.

### C. GitHub (for the Publish button and automatic deploys)

1. Create a service account key: Firebase console → Project settings → Service accounts → Generate new private key. Keep the file private.
2. GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
   - `FIREBASE_SERVICE_ACCOUNT` = the full contents of that JSON file.
3. Create a fine-grained GitHub token: GitHub → Settings → Developer settings → Fine-grained tokens → repository `skycrestsites/royaleluxury` → permission **Actions: Read and write**. Copy the token for step D.

### D. Deploy the backend (run in the project folder)

```bash
firebase use royaleluxury
firebase functions:secrets:set RESEND_API_KEY      # paste the Resend key
firebase functions:secrets:set GITHUB_TOKEN        # paste the GitHub token
firebase deploy --only firestore,storage,functions
```

Then load the sample data into production (uses the service account file from step C1):

```bash
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
npm run seed:prod
```

### E. Go live

1. Push to `main` (or press Publish in the admin). GitHub Actions builds and deploys to Firebase Hosting.
2. Firebase console → Hosting → Add custom domain → `royaleluxury.com`, then add the DNS records it shows.
3. Visit `https://royaleluxury.com/adminlogin/`, sign in with Google as `netspirestudios@gmail.com`. You become the owner automatically.
4. Admin → Team → invite other staff.

### F. Later

- Create the Stripe account and send the keys through Firebase secrets (never by chat), then we build phase 2.
- Turn on App Check.
