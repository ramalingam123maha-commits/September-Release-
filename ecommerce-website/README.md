# ShopEase — E-Commerce Website

A modern, responsive e-commerce storefront built with vanilla **HTML, CSS, and JavaScript** — no frameworks, no build step.

## Features

- **Product catalog** — 16 products across 4 categories (Electronics, Fashion, Home, Sports)
- **Category browsing** — click a category card to filter the shop
- **Filters** — filter products by category with a single click
- **Live search** — instant search-as-you-type over product names
- **Shopping cart** — slide-in drawer with add / remove / quantity controls
- **Persistent cart** — cart is saved to `localStorage` and survives refreshes
- **Checkout flow** — simulated order placement with total
- **Newsletter signup** — with inline confirmation
- **Toast notifications** — feedback on cart and subscribe actions
- **Fully responsive** — desktop, tablet, and mobile layouts with a hamburger nav
- **Animations** — hero blob morph, scroll-reveal cards, smooth transitions

## Project Structure

```
ecommerce-website/
├── index.html          # Markup & page structure
├── css/
│   └── style.css       # All styling & responsive rules
├── js/
│   ├── products.js     # Product & category data
│   └── app.js          # App logic (cart, filters, search, UI)
└── README.md
```

## Tech

- Semantic HTML5
- Modern CSS (custom properties, grid, flexbox, backdrop-filter, keyframe animations)
- Vanilla JavaScript (ES6+), `IntersectionObserver`, `localStorage`

No dependencies required — it's a fully static site.
