# Green Market

Green Market storefront built with Next.js App Router, React, TypeScript, and
Tailwind CSS.

## Requirements

- Node.js 20.11.0 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

```bash
npm run dev          # Start the Next.js dev server
npm run build        # Create a production build
npm run build:local  # Build with NEXT_BUILD_CPUS=4 on Windows
npm run start        # Start the production server after build
npm run lint         # Run ESLint
npm run check:utf8   # Verify UTF-8 content
```

## Project Structure

- `app/` - Next.js App Router pages, layout, metadata, and global CSS.
- `components/` - UI and page-level React components.
- `lib/` - Shared data loaders, cart logic, formatting, routes, and helpers.
- `public/data/` - Product, news, address, and product-description data.
- `public/images/` - Static image assets used by products, banners, and articles.
- `scripts/` - Maintenance scripts.

## Data Notes

Product and catalog data are stored in `public/data/products.json`.
Product descriptions are stored in `public/data/product-descriptions.json`.
News metadata is stored in `public/data/news.json`.
News article bodies are stored in `public/data/news/*.html` and are loaded by
the Next.js news routes.

Cart and checkout state are client-side flows backed by browser storage.

## Build

Before shipping changes, run:

```bash
npm run lint
npm run build
```
