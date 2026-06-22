document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let content = {};
  let cart = [];
  let currentFilter = 'todos';

  const $ = id => document.getElementById(id);
  const heroContent = $('hero-content');
  const menuHeader = $('menu-header');
  const categoryFilters = $('category-filters');
  const productsGrid = $('products-grid');
  const benefitsHeader = $('benefits-header');
  const benefitsGrid = $('benefits-grid');
  const contactWrapper = $('contact-wrapper');
  const footerEl = $('footer');
  const headerWhatsApp = $('header-whatsapp');
  const cartFab = $('cart-fab');
  const cartBadge = $('cart-badge');
  const cartOverlay = $('cart-overlay');
  const cartPanel = $('cart-panel');
  const cartClose = $('cart-close');
  const cartItems = $('cart-items');
  const cartFooter = $('cart-footer');

  async function loadData() {
    try {
      const [productsRes, contentRes] = await Promise.all([
        fetch('data/products.json'),
        fetch('data/content.json')
      ]);
      products = await productsRes.json();
      content = await contentRes.json();
      renderAll();
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  }

  function renderAll() {
    renderHero();
    renderMenuHeader();
    renderCategoryFilters();
    renderProducts();
    renderBenefitsHeader();
    renderBenefits();
    renderContact();
    renderFooter();
    updateHeaderWhatsApp();
    renderCart();
  }

  function renderHero() {
    const h = content.hero;
    if (!h) return;
    heroContent.innerHTML = `
      <span class="badge">${h.badge}</span>
      <h1>${h.title}</h1>
      <p>${h.description}</p>
      <div class="hero-buttons">
        <a href="#productos" class="btn btn-primary">Ver el Menú</a>
        <a href="#contacto" class="btn btn-secondary">Contáctanos</a>
      </div>
    `;
    const hero = document.querySelector('.hero');
    if (h.backgroundImage) {
      hero.style.backgroundImage = `url('${h.backgroundImage}')`;
    }
  }

  function renderMenuHeader() {
    const m = content.menu;
    if (!m) return;
    menuHeader.innerHTML = `
      <h2>${m.title}</h2>
      <p>${m.description}</p>
    `;
  }

  function renderCategoryFilters() {
    const cats = content.menu?.categories;
    if (!cats) return;
    categoryFilters.innerHTML = cats.map(c =>
      `<button class="filter-btn${c.id === 'todos' ? ' active' : ''}" data-filter="${c.id}">${c.label}</button>`
    ).join('');
    bindFilters();
  }

  function bindFilters() {
    categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilters.querySelector('.filter-btn.active')?.classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts();
        renderProductActions();
      });
    });
  }

  function renderProducts() {
    const filtered = currentFilter === 'todos'
      ? products
      : products.filter(p => p.category === currentFilter);

    productsGrid.innerHTML = filtered.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      const qty = cartItem ? cartItem.quantity : 0;

      return `
        <div class="product-card${p.available === false ? ' unavailable' : ''}" data-id="${p.id}">
          <div class="product-img">
            <img src="${p.image || ''}" alt="${p.name}" loading="lazy"
                 onerror="this.parentElement.innerHTML+='<div class=\\"unavailable-badge\\" style=\\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-card);color:var(--muted);font-size:3rem\\"><ion-icon name=\\"image-outline\\"></ion-icon></div>';this.style.display='none'">
            ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            ${p.available === false ? '<div class="unavailable-badge">No Disponible</div>' : ''}
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="product-footer">
              <span class="price">$${(p.price || 0).toFixed(2)}</span>
              <div class="product-actions" data-id="${p.id}">
                ${p.available === false ? '' : (qty > 0 ? `
                  <div class="qty-selector">
                    <button class="qty-btn" data-action="decrease">−</button>
                    <span class="qty-value">${qty}</span>
                    <button class="qty-btn" data-action="increase">+</button>
                  </div>
                ` : `
                  <button class="btn-add-cart">
                    <ion-icon name="cart-outline"></ion-icon>
                  </button>
                `)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindProductActions();
  }

  function bindProductActions() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      const card = btn.closest('.product-card');
      btn.addEventListener('click', () => addToCart(card.dataset.id));
    });

    document.querySelectorAll('.qty-btn').forEach(btn => {
      const card = btn.closest('.product-card');
      const action = btn.dataset.action;
      btn.addEventListener('click', () => {
        if (action === 'increase') addToCart(card.dataset.id);
        else if (action === 'decrease') decreaseFromCart(card.dataset.id);
      });
    });
  }

  function renderBenefitsHeader() {
    const bs = content.benefitsSection;
    if (!bs) return;
    benefitsHeader.innerHTML = `
      <h2>${bs.title}</h2>
      <p>${bs.description}</p>
    `;
  }

  function renderBenefits() {
    const benefits = content.benefits;
    if (!benefits) return;
    benefitsGrid.innerHTML = benefits.map(b => `
      <div class="benefit-card">
        <div class="benefit-icon"><ion-icon name="${b.icon}"></ion-icon></div>
        <h3>${b.title}</h3>
        <p>${b.description}</p>
      </div>
    `).join('');
  }

  function renderContact() {
    const c = content.contact;
    if (!c) return;
    contactWrapper.innerHTML = `
      <div class="contact-info">
        <h2>${c.title}</h2>
        <p>${c.description}</p>
        <div class="info-list">
          <div class="info-item">
            <ion-icon name="pin-outline"></ion-icon>
            <div><h4>Ubicación</h4><p>${c.address}</p></div>
          </div>
          <div class="info-item">
            <ion-icon name="call-outline"></ion-icon>
            <div><h4>Teléfono</h4><p>${c.phone}</p></div>
          </div>
          <div class="info-item">
            <ion-icon name="mail-outline"></ion-icon>
            <div><h4>Correo Electrónico</h4><p>${c.email}</p></div>
          </div>
        </div>
        <div class="social-links">
          ${c.social?.instagram ? `<a href="${c.social.instagram}" target="_blank" aria-label="Instagram"><ion-icon name="logo-instagram"></ion-icon></a>` : ''}
          ${c.social?.facebook ? `<a href="${c.social.facebook}" target="_blank" aria-label="Facebook"><ion-icon name="logo-facebook"></ion-icon></a>` : ''}
          ${c.social?.twitter ? `<a href="${c.social.twitter}" target="_blank" aria-label="Twitter"><ion-icon name="logo-twitter"></ion-icon></a>` : ''}
        </div>
      </div>
      <div class="contact-form-container">
        <form id="contact-form">
          <h3>Envíanos un Mensaje</h3>
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input type="text" id="name" required placeholder="Ej. Juan Pérez">
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" required placeholder="Ej. juan@correo.com">
          </div>
          <div class="form-group">
            <label for="message">Mensaje</label>
            <textarea id="message" rows="4" required placeholder="Escribe tu mensaje aquí..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block">
            <span class="btn-text">Enviar Mensaje</span>
            <ion-icon name="paper-plane-outline"></ion-icon>
          </button>
          <div id="form-feedback" class="form-feedback hidden"></div>
        </form>
      </div>
    `;
    bindContactForm();
  }

  function bindContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const feedback = document.getElementById('form-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('ion-icon');

    form.addEventListener('submit', e => {
      e.preventDefault();
      submitBtn.disabled = true;
      btnText.textContent = 'Enviando...';
      btnIcon.setAttribute('name', 'hourglass-outline');
      feedback.className = 'form-feedback hidden';

      setTimeout(() => {
        feedback.textContent = '¡Gracias! Tu mensaje fue enviado con éxito. Te responderemos pronto.';
        feedback.className = 'form-feedback success';
        form.reset();
        submitBtn.disabled = false;
        btnText.textContent = 'Enviar Mensaje';
        btnIcon.setAttribute('name', 'paper-plane-outline');
      }, 1500);
    });
  }

  function renderFooter() {
    const s = content.site;
    const c = content.contact;
    if (!s) return;
    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <img src="assets/images/logo-guayana.jpg" alt="Logo" class="footer-logo">
            <p>${s.description || ''}</p>
          </div>
          <div class="footer-links">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#productos">Productos</a></li>
              <li><a href="#beneficios">Nosotros</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-hours">
            <h4>Horario de Atención</h4>
            ${c?.hours ? `
              <p>${c.hours.weekdays}</p>
              <p>${c.hours.sundays}</p>
            ` : ''}
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} ${s.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
  }

  function updateHeaderWhatsApp() {
    const num = content.contact?.whatsapp;
    if (num) {
      headerWhatsApp.href = `https://wa.me/${num}?text=¡Hola!%20Me%20gustaría%20hacer%20un%20pedido.`;
    }
  }

  function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product || product.available === false) return;
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    updateCart();
  }

  function decreaseFromCart(id) {
    const existing = cart.find(c => c.id === id);
    if (!existing) return;
    if (existing.quantity > 1) {
      existing.quantity--;
    } else {
      cart = cart.filter(c => c.id !== id);
    }
    updateCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCart();
  }

  function getCartCount() {
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }

  function getCartTotal() {
    return cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  }

  function updateCart() {
    renderProducts();
    renderCart();
  }

  function renderCart() {
    const count = getCartCount();
    cartBadge.textContent = count;

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <ion-icon name="bag-outline"></ion-icon>
          <p>No has agregado nada aún</p>
        </div>
      `;
      cartFooter.innerHTML = `
        <button class="btn-whatsapp" disabled>
          <ion-icon name="logo-whatsapp"></ion-icon> Enviar pedido
        </button>
      `;
      return;
    }

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" data-id="${item.id}" data-action="decrease">−</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-action="increase">+</button>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
      </div>
    `).join('');

    const total = getCartTotal();
    const num = content.contact?.whatsapp || '584120000000';

    cartFooter.innerHTML = `
      <div class="cart-note">
        <label for="cart-direccion">📍 Dirección de entrega (opcional)</label>
        <textarea id="cart-direccion" rows="2" placeholder="Escribe tu dirección aquí..."></textarea>
      </div>
      <div class="cart-subtotal">
        <span>Subtotal</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <button class="btn-whatsapp" id="btn-whatsapp-send">
        <ion-icon name="logo-whatsapp"></ion-icon> Enviar pedido por WhatsApp
      </button>
    `;

    cartItems.querySelectorAll('.cart-qty-btn').forEach(btn => {
      const id = btn.dataset.id;
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'increase') addToCart(id);
        else decreaseFromCart(id);
      });
    });

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    document.getElementById('btn-whatsapp-send')?.addEventListener('click', sendToWhatsApp);
  }

  function sendToWhatsApp() {
    const num = content.contact?.whatsapp || '584120000000';
    const dir = document.getElementById('cart-direccion')?.value?.trim() || '';

    let lines = ['¡Hola! Quiero hacer un pedido:', ''];
    cart.forEach(item => {
      const sub = (item.price * item.quantity).toFixed(2);
      lines.push(`🍽 ${item.name} x${item.quantity} — $${sub}`);
    });
    lines.push('');
    lines.push(`─────────────────`);
    lines.push(`💰 *Total: $${getCartTotal().toFixed(2)}*`);
    if (dir) {
      lines.push('');
      lines.push(`📍 *Dirección:* ${dir}`);
    }

    const msg = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${num}?text=${msg}`;
    window.open(url, '_blank');
  }

  function openCart() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleCart() {
    if (cartPanel.classList.contains('open')) closeCart();
    else openCart();
  }

  cartFab.addEventListener('click', toggleCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-menu');
  const icon = toggle?.querySelector('ion-icon');
  const links = document.querySelectorAll('.nav-link');

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    if (icon) icon.setAttribute('name', open ? 'close-outline' : 'menu-outline');
  });

  links.forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open');
    if (icon) icon.setAttribute('name', 'menu-outline');
  }));

  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  });

  loadData();
});
