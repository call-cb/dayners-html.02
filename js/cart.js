(() => {
    const CART_KEY = 'dayners_cart';

    const loadCart = () => {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    };

    const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

    const money = (value) => `S/ ${Number(value).toFixed(2)}`;

    const updateBadge = () => {
        const cart = loadCart();
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = count;
    };

    const addOrUpdate = (product) => {
        const cart = loadCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(cart);
        updateBadge();
        renderCartPage();
        renderCheckoutPage();
        toast(`Se añadió ${product.name} al carrito`);
    };

    const toast = (message) => {
        let host = document.getElementById('cartToastHost');
        if (!host) {
            host = document.createElement('div');
            host.id = 'cartToastHost';
            host.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(host);
        }
        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center text-bg-dark border-0 show';
        toastEl.role = 'alert';
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
            </div>`;
        host.appendChild(toastEl);
        toastEl.querySelector('.btn-close').addEventListener('click', () => toastEl.remove());
        setTimeout(() => toastEl.remove(), 2500);
    };

    const renderCartPage = () => {
        const tbody = document.getElementById('cartTableBody');
        const totalEl = document.getElementById('cartTotal');
        const countEl = document.getElementById('cartItemsCount');
        if (!tbody || !totalEl || !countEl) return;

        const cart = loadCart();
        if (!cart.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">Tu carrito está vacío.</td></tr>';
            totalEl.textContent = money(0);
            countEl.textContent = '0';
            return;
        }

        let total = 0;
        tbody.innerHTML = cart.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
                <tr data-id="${item.id}">
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <img src="${item.image}" class="cart-item-image" alt="${item.name}">
                            <div>
                                <div class="fw-semibold">${item.name}</div>
                                <small class="text-muted">SKU ${item.id}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button class="btn btn-outline-secondary quantity-minus" type="button">-</button>
                            <input type="number" class="form-control text-center quantity-input" min="1" value="${item.quantity}">
                            <button class="btn btn-outline-secondary quantity-plus" type="button">+</button>
                        </div>
                    </td>
                    <td>${money(item.price)}</td>
                    <td class="item-subtotal">${money(subtotal)}</td>
                    <td><button class="btn btn-sm btn-outline-danger remove-item" type="button"><i class="bi bi-trash"></i></button></td>
                </tr>`;
        }).join('');

        totalEl.textContent = money(total);
        countEl.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

        tbody.querySelectorAll('tr').forEach(row => {
            const id = Number(row.dataset.id);
            const cart = loadCart();
            const item = cart.find(i => i.id === id);
            if (!item) return;

            row.querySelector('.remove-item')?.addEventListener('click', () => {
                const newCart = loadCart().filter(i => i.id !== id);
                saveCart(newCart);
                renderCartPage();
                renderCheckoutPage();
                updateBadge();
            });

            row.querySelector('.quantity-minus')?.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    saveCart(cart);
                    renderCartPage();
                    renderCheckoutPage();
                    updateBadge();
                }
            });

            row.querySelector('.quantity-plus')?.addEventListener('click', () => {
                item.quantity += 1;
                saveCart(cart);
                renderCartPage();
                renderCheckoutPage();
                updateBadge();
            });

            row.querySelector('.quantity-input')?.addEventListener('change', (e) => {
                const value = Math.max(1, Number(e.target.value || 1));
                item.quantity = value;
                saveCart(cart);
                renderCartPage();
                renderCheckoutPage();
                updateBadge();
            });
        });
    };

    const renderCheckoutPage = () => {
        const summary = document.getElementById('checkoutSummary');
        const totalEl = document.getElementById('checkoutTotal');
        const hiddenCart = document.getElementById('cartJson');
        if (!summary || !totalEl || !hiddenCart) return;

        const cart = loadCart();
        hiddenCart.value = JSON.stringify(cart.map(item => ({ productId: item.id, quantity: item.quantity })));

        if (!cart.length) {
            summary.innerHTML = '<div class="text-muted">El carrito está vacío.</div>';
            totalEl.textContent = money(0);
            return;
        }

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        summary.innerHTML = cart.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image}" class="cart-item-image" alt="${item.name}">
                    <div>
                        <div class="fw-semibold">${item.name}</div>
                        <small class="text-muted">Cantidad: ${item.quantity}</small>
                    </div>
                </div>
                <strong>${money(item.price * item.quantity)}</strong>
            </div>`).join('');
        totalEl.textContent = money(total);
    };

    document.addEventListener('click', (event) => {
        const button = event.target.closest('.add-to-cart');
        if (!button) return;
        addOrUpdate({
            id: Number(button.dataset.productId),
            name: button.dataset.productName,
            price: Number(button.dataset.productPrice),
            image: button.dataset.productImage
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        updateBadge();
        renderCartPage();
        renderCheckoutPage();
    });
})();
