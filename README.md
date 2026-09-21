# NovaTech Electronics

A small electronics ecommerce storefront (smartphones, TVs, mobile & TV accessories) used as a
sandbox site for testing a website-tracking SDK. Built with Angular (frontend) and Vercel Node
serverless functions + MongoDB Atlas (backend), deployed on Vercel.

It's a sibling of the `hotel-booking` and `organic-store-wp` sandbox sites in this workspace, but
built as an ordinary small team would build it — see "A note for the SDK team" below.

## Stack

- Angular 18 (standalone components, no NgModules), client-side rendered, no SSR
- Vercel Node serverless functions under `/api` (no framework — plain `(req, res) => {}` handlers)
- MongoDB Atlas via Mongoose
- Auth: mobile number + password, `jose` JWT in an httpOnly session cookie, `bcryptjs` for hashing

## Local development

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and JWT_SECRET
npm run seed                 # seeds the product catalog + one test user
npm start                    # ng serve, http://localhost:4200
```

The Angular dev server (`ng serve`) doesn't run the `/api` functions itself. To exercise the
full app locally (frontend + API together), use the Vercel CLI instead:

```bash
npm install -g vercel   # if not already installed
vercel dev
```

## Test credentials

Seeded by `npm run seed`:

- Mobile: `9999900001`
- Password: `Test@1234`

Or sign up a new account from `/signup` — first name, last name, mobile number and password are
all required.

## Catalog

12 products across 5 categories: Smartphones, TVs, Mobile Accessories, Accessories, and TV
Accessories (this last category is **deliberately left empty** — it exercises the site's
empty-state rendering, mirroring an equivalent empty category on the `organic-store-wp` sandbox
site).

## Payments

Checkout's "Pay now" button is a dummy payment gateway — it always succeeds. There's no real
payment processing anywhere in this app.

## Security notes

- The session token lives only in an httpOnly, `sameSite=lax` cookie (`secure` in production) —
  it's never exposed in a URL, query string, or any JS-readable storage, and no page ever encodes
  a password or token as a route/query parameter.
- Every API handler re-verifies the session cookie itself (not just the Angular route guard),
  and for user-owned resources (cart, favourites, addresses, orders) also re-checks that the
  resource belongs to the session's user — so a leaked id in a URL alone doesn't grant access.

## A note for the SDK team

Unlike the other two sandbox sites, this one does **not** maintain a curated cheat-sheet of
stable ids/classes picked to make SDK targeting easy. It's built the way an ordinary Angular team
would build it — normal semantic markup, ids only where the app itself needs one (e.g. a
`<label for>` target), classes chosen for styling. If the tracking script has trouble identifying
or following an element here, that's a real finding about its robustness against realistic markup
— not something this site should be reshaped to avoid.
