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

    // Create Checkout (using cartCreate mutation)
    createCheckout: async function (cartItems) {
        const query = `
            mutation cartCreate($input: CartInput!) {
                cartCreate(input: $input) {
                    cart {
                        checkoutUrl
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const variables = {
            input: {
                lines: cartItems.map(item => ({
                    merchandiseId: item.variantId,
                    quantity: item.qty
                }))
            }
        };

        try {
            const response = await fetch(`https://${this.config.domain}/api/2023-01/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': this.config.storefrontAccessToken
                },
                body: JSON.stringify({ query, variables })
            });

            const result = await response.json();

            if (result.data && result.data.cartCreate && result.data.cartCreate.cart) {
                window.location.href = result.data.cartCreate.cart.checkoutUrl;
            } else {
                console.error('TSS GraphQL Error:', result);
                alert('Connection to Supply Drop failed. ' + JSON.stringify(result.userErrors || result.errors));
            }

        } catch (e) {
            console.error('TSS Network Error:', e);
            alert('Secure Link Severed: ' + e.message);
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
