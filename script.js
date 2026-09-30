'use strict';

/**
 * Toy Haven - Main JavaScript Controller
 * Coursework Front-End Project (Vanilla JS, No Frameworks)
 * Data Storage: HTML5 localStorage for bag persistence, saved shelf, and demo orders
 */

// Storage keys for browser localStorage
const CART_KEY = 'toyHavenCart';
const WISH_KEY = 'toyHavenWishlist';

// Currency formatter for Sri Lankan Rupee (LKR)
// const money = value => 'Rs. ' + value; // previous simple format
const money = value => 'LKR ' + Number(value).toLocaleString('en-LK');

// Safe read from localStorage with fallback default
function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

// Save object to localStorage
function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cart() {
  const value = readStore(CART_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function wishlist() {
  const value = readStore(WISH_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function product(id) {
  return PRODUCTS.find(item => item.id === id);
}

function toast(message) {
  const box = document.querySelector('#toast');
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove('show'), 3000);
}

function updateCartCount() {
  document.querySelector('#cart-count').textContent = Object.values(cart()).reduce(
    (sum, quantity) => sum + Number(quantity || 0),
    0
  );
}

function addToCart(id) {
  const item = product(id);
  if (!item) return;

  const items = cart();
  items[id] = (Number(items[id]) || 0) + 1;
  saveStore(CART_KEY, items);
  updateCartCount();
  toast(item.name + ' added to your bag');

  if (document.body.dataset.page === 'cart') renderCart();
}

function toggleWish(id) {
  const saved = wishlist();

  if (saved[id]) {
    delete saved[id];
  } else {
    saved[id] = 'Interested';
  }

  saveStore(WISH_KEY, saved);

  document.querySelectorAll('[data-wish="' + id + '"]').forEach(button => {
    button.classList.toggle('is-saved', !!saved[id]);
    button.setAttribute(
      'aria-label',
      (saved[id] ? 'Remove ' : 'Save ') +
        (product(id)?.name || 'product') +
        (saved[id] ? ' from collection' : ' to collection')
    );
    button.innerHTML = saved[id] ? '&hearts;' : '&#9825;';
  });

  toast(saved[id] ? 'Saved to your collection' : 'Removed from your collection');

  if (document.body.dataset.page === 'wishlist') renderWishlist();
}

function card(item) {
  const saved = !!wishlist()[item.id];
  const badgeHtml = item.badge ? `<span class="card-badge">${item.badge}</span>` : '';
  const starsHtml = `<div class="card-rating" aria-label="Rated ${item.rating || 4.9} out of 5 stars">
    <span class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
    <span class="rating-num">${item.rating || '4.9'}</span>
    <span class="review-count">(${item.reviews || 12})</span>
  </div>`;
  const tagHtml = item.tag ? `<span class="card-tag">${item.tag}</span>` : '';

  return `<article class="product-card">
    <div class="card-media">
      <button class="card-image" type="button" data-detail="${item.id}" aria-label="View ${item.name} details">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </button>
      ${badgeHtml}
      <button type="button" class="wish-button ${saved ? 'is-saved' : ''}" data-wish="${item.id}" aria-label="${saved ? 'Remove ' + item.name + ' from' : 'Save ' + item.name + ' to'} collection">${saved ? '&hearts;' : '&#9825;'}</button>
    </div>
    <div class="card-info">
      <div class="card-header-meta">
        <span class="eyebrow">${item.category}</span>
        ${tagHtml}
      </div>
      <button type="button" class="product-name" data-detail="${item.id}">${item.name}</button>
      ${starsHtml}
      <div class="card-bottom">
        <div class="price-wrap">
          <span class="price-label">Price</span>
          <strong>${money(item.price)}</strong>
        </div>
        <button class="add-button" type="button" data-add="${item.id}" aria-label="Add ${item.name} to bag">
          <span>Add to Bag</span> +
        </button>
      </div>
    </div>
  </article>`;
}

// Hero banner slideshow with auto-play and manual controls (Test Cases 01 & 02)
function initHero() {
  const slides = [...document.querySelectorAll('.hero-slide')];
  if (!slides.length) return;

  let current = 0;
  const position = document.querySelector('#hero-position');
  const progress = document.querySelector('#hero-progress-fill');

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    if (position) {
      position.textContent =
        String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }
    if (progress) {
      progress.style.width = ((current + 1) / slides.length) * 100 + '%';
    }
  }

  // Auto-slides every 6.5s (Test Case 01: expects banner to advance within 7 seconds)
  let interval = setInterval(() => show(current + 1), 6500);

  function move(delta) {
    show(current + delta);
    // Reset timer on manual click so it doesn't jump immediately
    clearInterval(interval);
    interval = setInterval(() => show(current + 1), 6500);
  }

  const prev = document.querySelector('#hero-prev');
  const next = document.querySelector('#hero-next');
  if (prev) prev.addEventListener('click', () => move(-1));
  if (next) next.addEventListener('click', () => move(1));
}

function initHome() {
  const grid = document.querySelector('#featured-grid');
  if (!grid) return;

  // Render first 4 items as curator highlights on the homepage
  grid.innerHTML = PRODUCTS.slice(0, 4).map(card).join('');

  // Daily pick calculation based on date (rotates every 24 hours)
  const day = PRODUCTS[Math.floor(Date.now() / 86400000) % PRODUCTS.length];

  const dailyEl = document.querySelector('#daily-product');
  if (dailyEl) {
    dailyEl.innerHTML = `
      <div class="daily-card-inner">
        <div class="daily-badge">Curator's Daily Spotlight</div>
        <h3>${day.name}</h3>
        <p>${day.description}</p>
        <div class="daily-collector-quote">
          <span>Curator's Note:</span> "A standout piece in our display case today. Inspected for clean paint lines and pristine packaging."
        </div>
        <div class="daily-bottom">
          <strong class="daily-price">${money(day.price)}</strong>
          <a class="button button-outline" href="products.html?search=${encodeURIComponent(day.name)}">Meet today's pick &rarr;</a>
        </div>
      </div>
    `;
  }

  initHero();
}

function initProducts() {
  const grid = document.querySelector('#products-grid');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const valid = ['All', 'Figurines', 'Toys', 'Board Games', 'Diecast Cars'];
  let filter = valid.includes(params.get('category')) ? params.get('category') : 'All';

  const search = document.querySelector('#product-search');
  search.value = params.get('search') || '';

  function render() {
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    const term = search.value.trim().toLowerCase();
    const items = PRODUCTS.filter(
      p => (filter === 'All' || p.category === filter) && p.name.toLowerCase().includes(term)
    );
    grid.innerHTML = items.map(card).join('');
    document.querySelector('#result-count').textContent = `${items.length} ${items.length === 1 ? 'product' : 'products'}`;
    document.querySelector('#products-empty').hidden = items.length > 0;
  }

  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      render();
    });
  });

  search.addEventListener('input', render);
  render();

  const dialog = document.querySelector('#product-dialog');
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

function openDetail(id) {
  const item = product(id);
  const dialog = document.querySelector('#product-dialog');
  if (!item || !dialog) return;

  dialog.querySelector('#dialog-content').innerHTML = `
    <div class="dialog-media">
      <img src="${item.image}" alt="${item.name}">
      ${item.badge ? `<span class="card-badge dialog-badge">${item.badge}</span>` : ''}
    </div>
    <div class="dialog-info">
      <div class="card-header-meta">
        <span class="eyebrow">${item.category}</span>
        ${item.tag ? `<span class="card-tag">${item.tag}</span>` : ''}
      </div>
      <h2>${item.name}</h2>
      <div class="card-rating" aria-label="Rated ${item.rating || 4.9} out of 5 stars">
        <span class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span class="rating-num">${item.rating || '4.9'}</span>
        <span class="review-count">(${item.reviews || 12} collector reviews)</span>
      </div>
      <p class="dialog-description">${item.description}</p>
      
      <div class="dialog-collector-specs">
        <div class="dialog-spec-item">
          <span>Condition</span>
          <strong>Mint in Box (Grade A+)</strong>
        </div>
        <div class="dialog-spec-item">
          <span>In-Store Stock</span>
          <strong class="in-stock-note">&bull; Ready for pickup in Kurunegala</strong>
        </div>
      </div>

      <div class="dialog-price-row">
        <div class="price-wrap">
          <span class="price-label">Collector Price</span>
          <strong>${money(item.price)}</strong>
        </div>
        <button class="button button-light" type="button" data-add="${item.id}">Add to bag &rarr;</button>
      </div>

      <p class="dialog-assurance">Padded bubble wrap protection &bull; Island-wide delivery across Sri Lanka</p>
    </div>
  `;

  dialog.showModal();
}

function cartEntries() {
  return Object.entries(cart())
    .map(([id, quantity]) => ({ item: product(id), quantity: Number(quantity) }))
    .filter(row => row.item && row.quantity > 0);
}

function renderCart() {
  const rows = cartEntries();
  const container = document.querySelector('#cart-items');
  if (!container) return;

  container.innerHTML = rows
    .map(
      ({ item, quantity }) => `
    <article class="cart-row">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-row-info">
        <span class="eyebrow">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${money(item.price)} each</p>
        <button class="subtle-button" type="button" data-remove="${item.id}">Remove</button>
      </div>
      <div class="quantity">
        <button type="button" data-qty="${item.id}" data-step="-1" aria-label="Decrease ${item.name} quantity">-</button>
        <span>${quantity}</span>
        <button type="button" data-qty="${item.id}" data-step="1" aria-label="Increase ${item.name} quantity">+</button>
      </div>
      <strong>${money(item.price * quantity)}</strong>
    </article>`
    )
    .join('');

  const total = rows.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  document.querySelector('#cart-items-label').textContent = '(' + rows.length + ')';
  document.querySelector('#cart-subtotal').textContent = money(total);
  document.querySelector('#cart-total').textContent = money(total);
  document.querySelector('#cart-empty').hidden = rows.length > 0;
  document.querySelector('#clear-cart').hidden = rows.length === 0;

  const checkout = document.querySelector('#checkout-link');
  checkout.classList.toggle('disabled', rows.length === 0);
  checkout.setAttribute('aria-disabled', String(rows.length === 0));
}

function renderWishlist() {
  const grid = document.querySelector('#wishlist-grid');
  if (!grid) return;

  const saved = wishlist();
  const items = PRODUCTS.filter(item => saved[item.id]);

  grid.innerHTML = items
    .map(
      item => `
    <div class="wishlist-entry">
      ${card(item)}
      <label>Status 
        <select data-status="${item.id}">
          <option value="Interested" ${saved[item.id] === 'Interested' ? 'selected' : ''}>Interested</option>
          <option value="Owned" ${saved[item.id] === 'Owned' ? 'selected' : ''}>Owned</option>
          <option value="Not Interested" ${saved[item.id] === 'Not Interested' ? 'selected' : ''}>Not Interested</option>
        </select>
      </label>
    </div>`
    )
    .join('');

  document.querySelector('#wishlist-empty').hidden = items.length > 0;
}

function error(message, element, focus) {
  element.textContent = message;
  element.classList.toggle('error', !!message);
  if (focus) focus.focus();
}

function validateFields(form, message) {
  for (const field of [...form.querySelectorAll('input[required], textarea[required]')]) {
    if (field.type === 'radio') {
      if (!form.querySelector('input[name="payment"]:checked')) {
        error('Choose a payment method.', message, field);
        return false;
      }
      continue;
    }

    if (!field.value.trim()) {
      error(
        'Please complete ' + (field.closest('label')?.firstChild.textContent.trim() || 'this field') + '.',
        message,
        field
      );
      return false;
    }

    if (field.type === 'email' && !field.validity.valid) {
      error('Enter a valid email address.', message, field);
      return false;
    }

    if (field.minLength > 0 && field.value.trim().length < field.minLength) {
      error('Please add a little more detail.', message, field);
      return false;
    }
  }

  error('', message);
  return true;
}

function initCheckout() {
  const form = document.querySelector('#checkout-form');
  if (!form) return;

  const rows = cartEntries();
  const summary = document.querySelector('#checkout-items');

  summary.innerHTML =
    rows
      .map(
        ({ item, quantity }) => `
    <div class="checkout-line">
      <span>${item.name} &times; ${quantity}</span>
      <strong>${money(item.price * quantity)}</strong>
    </div>`
      )
      .join('') || '<p>Your bag is empty. <a href="products.html">Browse products</a>.</p>';

  const total = rows.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  document.querySelector('#checkout-total').textContent = money(total);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#checkout-message');

    if (!cartEntries().length) {
      error('Your bag is empty. Add something before checking out.', message);
      return;
    }

    if (!validateFields(form, message)) return;

    const details = new FormData(form);
    const orders = readStore('toyHavenOrders', []);

    orders.push({
      id: 'TH-' + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: String(details.get('fullName')).trim(),
        email: String(details.get('email')).trim(),
        address: String(details.get('address')).trim()
      },
      payment: details.get('payment'),
      items: cartEntries().map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
        price: item.price
      })),
      total
    });

    saveStore('toyHavenOrders', orders);
    localStorage.removeItem(CART_KEY);
    updateCartCount();

    document.querySelector('#checkout-layout').hidden = true;
    document.querySelector('#order-success').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSupport() {
  const form = document.querySelector('#feedback-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#feedback-message');
    if (!validateFields(form, message)) return;

    const data = new FormData(form);
    const feedback = readStore('toyHavenFeedback', []);

    feedback.push({
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      message: String(data.get('message')).trim(),
      date: new Date().toISOString()
    });

    saveStore('toyHavenFeedback', feedback);
    error('Message saved. Thanks for getting in touch!', message);
    form.reset();
  });

  document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const opened = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!opened));
      button.nextElementSibling.hidden = opened;
      button.querySelector('span').textContent = opened ? '+' : '-';
    });
  });
}

function initNewsletter() {
  const form = document.querySelector('#newsletter-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const field = form.elements.namedItem('email');
    const message = document.querySelector('#newsletter-message');

    if (!field.validity.valid || !field.value.trim()) {
      error('Please enter a valid email address.', message, field);
      return;
    }

    const emails = readStore('toyHavenNewsletter', []);
    const value = field.value.trim().toLowerCase();

    if (!emails.includes(value)) emails.push(value);
    saveStore('toyHavenNewsletter', emails);
    error("You're on the list. Thanks!", message);
    form.reset();
  });
}

function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    button.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('open', !open);
  });
}

function initReveals() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
    addToCart(add.dataset.add);
    return;
  }

  const wish = event.target.closest('[data-wish]');
  if (wish) {
    toggleWish(wish.dataset.wish);
    return;
  }

  const detail = event.target.closest('[data-detail]');
  if (detail) {
    openDetail(detail.dataset.detail);
    return;
  }

  const qty = event.target.closest('[data-qty]');
  if (qty) {
    const items = cart();
    const id = qty.dataset.qty;
    items[id] = Math.max(0, (Number(items[id]) || 0) + Number(qty.dataset.step));
    if (!items[id]) delete items[id];
    saveStore(CART_KEY, items);
    updateCartCount();
    renderCart();
    return;
  }

  const remove = event.target.closest('[data-remove]');
  if (remove) {
    const items = cart();
    delete items[remove.dataset.remove];
    saveStore(CART_KEY, items);
    updateCartCount();
    renderCart();
  }
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-status]')) {
    const saved = wishlist();
    saved[event.target.dataset.status] = event.target.value;
    saveStore(WISH_KEY, saved);
    toast('Collection status updated');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initNewsletter();
  initHome();
  initProducts();
  renderWishlist();
  renderCart();
  initCheckout();
  initSupport();
  initReveals();
  updateCartCount();

  document.querySelector('#clear-cart')?.addEventListener('click', () => {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
    toast('Your bag is clear');
  });

  document.querySelector('#checkout-link')?.addEventListener('click', event => {
    if (!cartEntries().length) event.preventDefault();
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});