# Gear Rental

Camera & lens rental site for Reem Island, Abu Dhabi. React + TypeScript + Vite,
deployed to GitHub Pages, with optional Firebase backend for live calendar +
admin panel.

Live URL: **https://arbazpirwani.github.io/gear-rental/**

---

## How it works

The site has two operating modes:

| Without Firebase env vars | With Firebase env vars |
| --- | --- |
| Catalog reads from `src/data/products.ts` (the seed). | Catalog reads from Firestore `products` collection (admin-editable). |
| Booking submission opens WhatsApp prefilled with the request. | Booking submission writes to Firestore *and* opens WhatsApp. Admin sees it in the panel. |
| No live calendar. | Per-product calendar shows pending and confirmed booked dates. |
| No admin panel. | `/admin` route with Google sign-in for the admin email. |

You can ship in mode A and turn on mode B whenever you create a Firebase
project. No code changes required.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:5173/gear-rental/
npm run build        # production bundle
npm run preview      # preview the production bundle locally
```

To use Firebase locally, create `.env.local` from `.env.example` and paste your
Firebase web app config (see "Phase 2: Firebase setup" below).

---

## Project layout

```
src/
  data/products.ts         ← seed catalog used until Firestore is populated
  lib/firebase.ts          ← Firebase init (no-ops if env not set)
  lib/pricing.ts           ← multi-day + bundle discount math
  lib/whatsapp.ts          ← WhatsApp message builder + your phone number
  lib/storage.ts           ← localStorage cart
  lib/cartContext.ts       ← cart provider
  lib/authContext.tsx      ← Firebase Auth provider + admin check
  lib/db/products.ts       ← Firestore products read/write + seed fallback
  lib/db/availability.ts   ← Firestore bookedDates calendar
  lib/db/bookings.ts       ← Firestore bookings collection
  pages/                   ← Home, Product, Cart, Checkout, ThankYou, Agreement, About, Admin
  components/              ← Layout, ProductCard, ProductImage, AvailabilityNotice
  components/admin/        ← AdminBookings, AdminProducts, AdminSettings
public/images/             ← SVG illustrations per product (drop a JPG with the
                            same filename to replace one)
firestore.rules            ← deploy these rules to your Firebase project
scripts/generate-placeholders.mjs   ← regenerates the SVG illustrations
```

### Editing prices

- **Without Firebase**: edit `src/data/products.ts`, push to `main`. GitHub
  Actions rebuilds and redeploys.
- **With Firebase**: log in at `/admin`, go to Products tab, click Edit on any
  product, change price/deposit/title, click Save. Live in seconds, no deploy.

### Replacing product images

Each product has an SVG illustration in `public/images/` matching its `id`.
To swap in a real photo:
1. Save your photo as JPG (1200×900, ~200 KB) into `public/images/`.
2. Edit the `image:` path in `src/data/products.ts` (or in admin panel) to use
   `.jpg` instead of `.svg`.
3. Push.

---

## GitHub Pages — first-time deploy

1. Create a public repo named **`gear-rental`** under your `arbazpirwani` GitHub
   account at https://github.com/new.
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: gear rental MVP"
   git branch -M main
   git remote add origin git@github.com:arbazpirwani/gear-rental.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → "GitHub Actions"**.
4. The included `.github/workflows/deploy.yml` will build + publish on every
   push to `main`.

---

## Phase 2: Firebase setup (~5 min, once)

This unlocks: live calendar, admin panel, products in Firestore.

### Step 1 — Create the Firebase project
1. Visit https://console.firebase.google.com → **Add project** → name it
   `gear-rental` → skip Google Analytics (or enable, doesn't matter) → Continue.
2. In the project: **Build → Firestore Database → Create database** →
   choose **production mode** → region **eur3** (closest free tier to UAE).
3. **Build → Authentication → Get started → enable Google sign-in** (use your
   Gmail as the support email).
4. **Authentication → Settings → Authorized domains → Add domain →**
   `arbazpirwani.github.io`.
5. **Project settings (gear icon) → General → Your apps → Web (`</>` icon) →**
   register app, copy the `firebaseConfig` object that's shown.

### Step 2 — Wire up the env vars

Locally (for `npm run dev`):
1. Copy `.env.example` to `.env.local`.
2. Paste each value from `firebaseConfig` into the matching `VITE_FIREBASE_*` var.
3. Set `VITE_ADMIN_EMAILS` to your Google sign-in email.

For production (deployed site):
1. On GitHub: **Settings → Secrets and variables → Actions → New repository
   secret** for each `VITE_FIREBASE_*` var.
2. Update `.github/workflows/deploy.yml` to pass them at build time. (See
   "GitHub Actions secrets" section below.)

### Step 3 — Deploy the Firestore rules

The `firestore.rules` file controls who can read/write. To deploy:
- **Easy way (no CLI)**: open the rules tab in Firebase Console → Firestore →
  Rules → paste the contents of `firestore.rules` → Publish.
- Edit the `isAdmin()` function in the rules to include your admin email if
  it's different from `ext_arbaz.hanif@astratech.ae`.

### Step 4 — Seed the products

1. Visit `/admin` on your deployed site (or `npm run dev` locally).
2. Sign in with Google using your admin email.
3. Click the **Settings** tab → **Seed defaults** → confirm.
4. The 14 products from `src/data/products.ts` are written to Firestore.
5. Switch to the **Products** tab to verify and start editing.

That's it — the catalog now reads from Firestore, customers see live calendar
availability, and incoming booking requests appear in the **Bookings** tab.

### GitHub Actions secrets (for deployed Firebase)

Add to `.github/workflows/deploy.yml` build step:

```yaml
- run: npm run build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    VITE_ADMIN_EMAILS: ${{ secrets.VITE_ADMIN_EMAILS }}
```

---

## Booking flow

1. Customer browses the catalog and adds items to the cart with their dates.
2. On the product page, the calendar shows existing pending/confirmed bookings
   so they don't request blocked dates.
3. They go to **Checkout**, fill name / phone / email / notes, tick the rental
   agreement, then click **Submit booking request**.
4. The request writes to Firestore (status = `pending`) and opens WhatsApp
   prefilled with the full request including a booking ID.
5. Customer sends the WhatsApp message; you receive it on +971 55 987 0068.
6. You log in to `/admin`, see the new booking, confirm availability, and
   reply via WhatsApp with bank-transfer details.
7. Once advance is paid, change booking status to `confirmed`. The calendar
   block flips from "pending" to "confirmed".
8. Pickup → mark `picked_up`. Return → mark `returned`. Issues → keep notes.

> **Borrowed phrasing from actionfilmz.com**: "Submitting this list does not
> guarantee the availability of equipment. Our rental coordinator will WhatsApp
> you back with a final quote." This is shown on the cart and checkout pages.

---

## Pricing model (current defaults)

| Tier              | Charge                                        |
| ----------------- | --------------------------------------------- |
| Day 1             | 100% of daily rate                            |
| Day 2             | 75%                                           |
| Day 3+            | 60%                                           |
| Bundle: 3+ items  | 10% off rental subtotal (deposit not changed) |
| Bundle: 5+ items  | 15% off                                       |
| Advance to confirm | 30% of rental total (min AED 100)            |
| Card payments     | Not accepted — bank transfer or cash          |

After Phase 2 setup, individual product prices/deposits become editable in
`/admin` → Products. The pricing tier formulas stay in `src/lib/pricing.ts`.

---

## What's NOT yet built (future)

- **Customer accounts** ("My orders" page) — Firestore is set up to allow this
  later, but the UI isn't shipped. Customers track their booking through
  WhatsApp + the booking ID shown on the thank-you page.
- **Card payments** — explicitly disabled (bank transfer / cash only). Adding a
  payment provider (Stripe / Telr / Tap) would be Phase 3.
- **Email confirmation to customer** — would need a Cloud Function (Blaze plan)
  or third-party email service like EmailJS. WhatsApp covers the gap for now.
- **Live calendar block deletion when booking is cancelled** — currently
  manual: cancel a booking in `/admin`, then delete the matching `bookedDates`
  doc in Firestore Console. Easy to wire up automatically later.
