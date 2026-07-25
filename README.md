# Salamo — Multi-Vendor E-Commerce Marketplace

Full-stack marketplace built with Next.js: buyer storefront, seller dashboards, platform admin, Stripe checkout, and buyer–seller messaging.

## Stack

- Next.js (App Router), React, TypeScript
- Prisma + MySQL
- Clerk authentication
- Stripe payments (PaymentIntents + webhooks)
- Cloudinary image uploads
- Tailwind CSS + shadcn/ui

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Fill in values in `.env` (never commit real secrets).

3. Install dependencies and run migrations:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list. Required for local development:

- `DATABASE_URL`
- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`)
- Stripe keys (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Cloudinary (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_PRESET_NAME`)

Optional:

- `ADMIN_EMAILS` — comma-separated emails that receive `ADMIN` role on Clerk signup
- `IPINFO_TOKEN` — country detection for shipping defaults

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
