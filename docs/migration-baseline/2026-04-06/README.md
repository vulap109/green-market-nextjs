# Green Market migration baseline - 2026-04-06

Baseline nay duoc khoa truoc khi bat dau migration sang Next.js.

- Baseline date: `2026-04-06`
- Git commit: `ff6eb0c9c21ad09fb4e66fe743ea2f173ba8c6ed`
- Working tree: clean tai luc capture
- Current app shape: static multi-page HTML + JS, khong co build step hay package manager

## Route inventory

### Core commerce routes

| Public route | Source file | Muc dich | URL state / query param | Ghi chu migration |
| --- | --- | --- | --- | --- |
| `/` | `index.html` | Home page | khong co | Home card/news dang deep-link sang cac route legacy ben duoi |
| `/all-products.html` | `all-products.html` | Listing / category / search | `q`, `keyword` | Filter subcategory, price, pagination chi la client state, chua sync len URL |
| `/product.html` | `product.html` | Product detail | `slug`, `id` | `slug` duoc uu tien hon `id` neu cung ton tai |
| `/cart.html` | `cart.html` | Cart review | khong co | Doc state tu `localStorage.cart_v1` |
| `/check-out.html` | `check-out.html` | Checkout | khong co | Default payment method la bank transfer |
| `/order-success.html` | `order-success.html` | Order confirmation | `code` | Can khop `code` tren URL voi order vua luu trong localStorage |
| `/news.html` | `news.html` | News detail | `slug`, `#hash` | Neu khong co `slug` thi mac dinh lay bai viet dau tien trong `data/news.json` |

### Static informational routes

| Public route | Source file | Muc dich |
| --- | --- | --- |
| `/address.html` | `address.html` | Static page |
| `/checking-policy.html` | `checking-policy.html` | Policy page |
| `/delivery-policy.html` | `delivery-policy.html` | Policy page |
| `/payment-policy.html` | `payment-policy.html` | Policy page |
| `/privacy-policy.html` | `privacy-policy.html` | Policy page |
| `/return-policy.html` | `return-policy.html` | Policy page |

## Query param va URL behavior

### `/all-products.html`

- `q`: route mode / category alias.
- Supported values tu code hien tai:
  - `ban-chay-nhat`
  - `khuyen-mai`
  - `gio-qua-trai-cay`
  - `qua-tang-thuc-pham`
  - `trai-cay-nhap-khau`
  - `banh-kem`
  - `hoa-tuoi`
- `keyword`: keyword search tu header search.
- State khong nam tren URL:
  - subcategory filter
  - price range filter
  - pagination page
- Implication: neu migration muon deep-link duoc pagination/filter, day la thay doi behavior, khong phai parity.

### `/product.html`

- `slug`: primary lookup key.
- `id`: fallback lookup key.
- Missing ca `slug` va `id`: redirect ve `/`.
- Not found product: alert roi redirect ve `/all-products.html`.

### `/news.html`

- `slug`: lookup bai viet trong `data/news.json`.
- `#hash`: sau khi render article content, page se scroll den section tuong ung neu ton tai.
- Missing `slug`: tu dong `replaceState` sang slug cua bai viet dau tien.

### `/order-success.html`

- `code`: chi dung de verify order vua dat.
- Page se render empty state neu:
  - khong co `green_market_last_success_order_v1` trong localStorage
  - hoac `storedOrder.code` khong khop voi `code` tren URL

## Client-side persisted state

### `localStorage.cart_v1`

Du lieu gio hang hien tai duoc luu theo item:

```json
{
  "id": "66",
  "qty": 1,
  "priceSnapshot": 370000,
  "size": "16cm"
}
```

Notes:

- `id` duoc normalize thanh string.
- `size` chi xuat hien voi banh kem / variant.
- `priceSnapshot` duoc dung de giu dung don gia tai thoi diem add cart.

### `localStorage.green_market_last_success_order_v1`

Checkout save payload order vao key nay truoc khi redirect sang success page.

Payload gom:

- `code`
- `createdAt`
- customer fields: `fullname`, `phone`, `email`
- address fields: `province`, `district`, `ward`, `address`
- `notes`
- `paymentMethod`
- `items`
- `subtotal`
- `shippingFee`
- `total`

## Critical flows

### Cart flow

1. Home / listing card click di vao `/product.html?slug=...`.
2. Product detail `handleAddToCart()` ghi vao `cart_v1`.
3. `Mua ngay` o product detail add vao cart roi redirect sang `/cart.html`.
4. Cart page hydrate lai item tu `products.json`, cho phep:
   - tang / giam so luong
   - xoa item
   - tinh tong tien tu `priceSnapshot` neu co
5. CTA `Thanh toan` tren cart redirect sang `/check-out.html`.

### Checkout flow

1. Checkout load:
   - cart tu `cart_v1`
   - product data tu `data/products.json`
   - address data tu `data/vietnamAddress.json`
2. Neu cart rong:
   - summary hien empty state
   - nut submit bi disable
   - `validateAndSubmit()` se alert va redirect ve `/cart.html`
3. Validate required fields:
   - `fullname`
   - `phone`
   - `province`
   - `district`
   - `ward`
   - `address`
4. Payment method default la `bank`, co the chuyen sang `cod`.
5. Submit flow:
   - build order payload
   - send EmailJS
   - save order vao `green_market_last_success_order_v1`
   - clear cart
   - reset form
   - redirect `/order-success.html?code=<orderCode>`

### News flow

1. Home news cards deep-link sang `/news.html?slug=...`.
2. `news.html` load metadata tu `data/news.json`.
3. Article body duoc fetch tu `data/news/<slug>.html`.
4. Neu co hash thi scroll den section sau khi content render xong.
5. Share buttons dung current URL cua browser.

### Product detail flow

1. Load product theo `slug` hoac `id`.
2. Render basic info, image, SKU, description, similar products.
3. Neu category la `cream-cake`, page render size selector va gia phu thuoc size.
4. Khi add cart voi banh kem, cart item se luu them:
   - `size`
   - `priceSnapshot` theo size da chon
5. Similar products duoc lay cung category, toi da 5 item.

## Screenshot set

Desktop baseline screenshots duoc generate boi script:

- `screenshots/01-home.png`
- `screenshots/02-all-products-fruit-basket.png`
- `screenshots/03-all-products-search-keyword.png`
- `screenshots/04-product-detail-fruit-basket.png`
- `screenshots/05-product-detail-cream-cake.png`
- `screenshots/06-cart-with-items.png`
- `screenshots/07-checkout-with-items.png`
- `screenshots/08-news-detail.png`
- `screenshots/09-order-success-cod.png`

Lenh regenerate:

```bash
node scripts/capture-baseline.mjs
```

Script se tao them:

- `docs/migration-baseline/2026-04-06/capture-manifest.json`

## Migration guardrails

- Giu backward compatibility cho cac URL query param legacy: `q`, `keyword`, `slug`, `id`, `code`.
- Khong lam mat behavior `slug` precedence tren product detail.
- Khong lam mat fallback `news.html` -> first article khi khong co slug.
- Cart migration can support item co `size` + `priceSnapshot`.
- Success page can doc order vua dat tu localStorage neu chua co backend order detail route.
- Neu doi route structure sang Next.js cleaner hon, nen co rewrite/redirect map cho toan bo route legacy ben tren.
