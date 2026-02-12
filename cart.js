// Tactical Stealth Solutions - Cart System
// Handles localStorage persistence and UI rendering for the shopping cart

const CART_KEY = 'tss_cart_v1';

const Cart = {
    // Get cart from storage
    get() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    },

    // Save cart to storage
    save(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        this.updateCount();
        this.render();
    },

    // Add item (or update qty if exists)
    add(product) {
        const cart = this.get();
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        this.save(cart);
        this.open();
    },

    // Remove item
    remove(id) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== id);
        this.save(cart);
    },

    // Clear cart
    clear() {
        localStorage.removeItem(CART_KEY);
        this.updateCount();
        this.render();
    },

    // Calculate total
    total() {
        return this.get().reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    // Update cart count badge
    updateCount() {
        const count = this.get().reduce((sum, item) => sum + item.qty, 0);
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(el => el.textContent = count);

        // Hide badge if 0
        badges.forEach(el => el.style.display = count > 0 ? 'flex' : 'none');
    },

    // Render Cart UI
    render() {
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total');
        if (!container || !totalEl) return;

        const cart = this.get();
        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Supplies Depleted.</div>';
            totalEl.textContent = '0.00 €';
            return;
        }

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} € x ${item.qty}</p>
                </div>
                <button class="btn-remove" onclick="Cart.remove('${item.id}')">×</button>
            `;
            container.appendChild(el);
        });

        totalEl.textContent = this.total().toFixed(2) + ' €';
    },

    // UI Controls
    open() {
        document.getElementById('cart-sidebar').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
    },

    close() {
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
    },

    // Initialize
    init() {
        this.updateCount();
        this.render();

        // Attach Event Listeners
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-trigger')) {
                this.open();
            }
            if (e.target.id === 'cart-overlay' || e.target.closest('.close-cart')) {
                this.close();
            }
            // Add to Cart Buttons
            if (e.target.closest('.add-to-cart')) {
                const btn = e.target.closest('.add-to-cart');
                const product = {
                    id: btn.dataset.id,
                    variantId: btn.dataset.variantId, // Capture Shopify Variant ID
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price)
                };
                this.add(product);
            }
        });
    }
};

// Start Cart
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
