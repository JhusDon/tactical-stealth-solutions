/* =========================================
   HEADLESS SHOPIFY INTEGRATION (TSS)
   ========================================= */

const shop = {
    client: null,

    // CONFIGURATION
    config: {
        domain: 'tactical-stealth-solutions.myshopify.com', // Updated by Assistant
        storefrontAccessToken: 'c8e83a69303e70ada363fb47762bffce' // Updated by Assistant
    },

    // Initialize
    init: function () {
        if (window.ShopifyBuy) {
            this.client = ShopifyBuy.buildClient(this.config);
            console.log('TSS: Shopify Client Active.');
            this.fetchAllProducts(); // Helper to see IDs in Console
        } else {
            console.error('TSS: Shopify SDK not loaded.');
        }
    },

    // Create Checkout with multiple items
    createCheckout: async function (cartItems) {
        if (!this.client) return;

        try {
            // Create Checkout
            const checkout = await this.client.checkout.create();

            // Format line items for Shopify
            const lineItemsToAdd = cartItems.map(item => ({
                variantId: item.variantId,
                quantity: item.qty
            }));

            // Add Items
            const newCheckout = await this.client.checkout.addLineItems(checkout.id, lineItemsToAdd);

            // Redirect to Shopify Checkout
            window.location.href = newCheckout.webUrl;

        } catch (e) {
            console.error('TSS Error:', e);
            alert('Secure Connection Failed. Please try again.');
        }
    },

    // Helper: Print all IDs so you can copy them to HTML
    fetchAllProducts: async function () {
        const products = await this.client.product.fetchAll();
        console.group('🛒 SHOPIFY PRODUCT IDs');
        products.forEach(p => {
            console.log(`PRODUCT: ${p.title}`);
            p.variants.forEach(v => {
                console.log(`  VARIANT: ${v.title} -> ID: ${v.id}`);
            });
        });
        console.groupEnd();
    }
};

// Auto-Init
document.addEventListener('DOMContentLoaded', () => {
    shop.init();
    // Expose to window
    window.shop = shop;

    // Listen for Checkout Button (Delegated)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-shopify-checkout') {
            e.preventDefault();
            const btn = e.target;

            // Ensure Cart exists
            if (typeof Cart === 'undefined') {
                console.error('TSS Error: Cart not loaded');
                return;
            }

            const cartItems = Cart.get();
            if (cartItems.length > 0) {
                btn.textContent = 'INITIALIZING DROP...'; // Feedback
                shop.createCheckout(cartItems);
            } else {
                alert('Supply Crate is empty.');
            }
        }
    });
});
