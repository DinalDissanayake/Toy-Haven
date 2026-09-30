# Toy Haven

Six-page front-end toy shop built with HTML, CSS and JavaScript. No framework or build step is needed.

## Run locally

Open this folder in VS Code, then use Live Server on `index.html`. You can also run `python -m http.server 8000` inside this folder and open `http://localhost:8000`.

## Pages

- `index.html` — rotating banner, featured products, categories, daily product
- `products.html` — catalogue, search, filters, product detail dialog
- `wishlist.html` — saved products and collection status
- `cart.html` — bag, quantity controls and total
- `checkout.html` — demo checkout and saved order history
- `support.html` — feedback form and FAQs

Shared code is in `style.css`, `products-data.js`, and `script.js`. Photos and logo are in `assets/`. Data is saved in browser localStorage, so it is specific to that browser. Card checkout is a simulation and never asks for payment card details. The site includes a manifest and service worker for PWA support on localhost or HTTPS.

## GitHub Pages

Upload the contents of this folder to a GitHub repository. In Settings → Pages, deploy from the `main` branch and root folder. Add the public URL to the submission document after checking it on mobile and desktop.
