// email-service.js

// Initialize EmailJS (User needs to add this script to head first: <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>)

// USER CONFIGURATION REQUIRED
const EMAILJS_PUBLIC_KEY = "wRYqN4coKphKVKPSM"; // LIVE KEY
const SERVICE_ID = "service_awc4q57";         // LIVE SERVICE
const TEMPLATE_ID_ORDER = "template_rlev175"; // LIVE TEMPLATE 1
const TEMPLATE_ID_SHIPPING = "template_sl0hdrc"; // LIVE TEMPLATE 2

// Check if keys are set
const isConfigured = () => {
    return EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY";
};

/**
 * Send Order Confirmation Email
 * @param {Object} order - Order object {id, customer, items, total}
 */
export const sendOrderConfirmation = async (order) => {
    if (!isConfigured()) {
        console.warn("EmailJS not configured. Skipping email.");
        return;
    }

    const itemsList = order.items.map(i => `${i.qty}x ${i.name}`).join('\n');

    const templateParams = {
        to_name: order.customer.name,
        to_email: order.customer.email,
        order_id: order.id,
        items_list: itemsList,
        total_amount: order.total.toFixed(2) + " €",
        address: `${order.customer.address}, ${order.customer.city}`
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_ORDER, templateParams);
        console.log("Order confirmation email sent.");
    } catch (error) {
        console.error("Failed to send order email:", error);
    }
};

/**
 * Send Shipping Confirmation Email
 * @param {Object} order - Order object {id, customer, trackingNumber}
 */
export const sendShippingConfirmation = async (order) => {
    if (!isConfigured()) {
        console.warn("EmailJS not configured. Skipping email.");
        return;
    }

    const templateParams = {
        to_name: order.customer.name,
        to_email: order.customer.email,
        order_id: order.id,
        tracking_number: order.trackingNumber
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_SHIPPING, templateParams);
        console.log("Shipping confirmation email sent.");
    } catch (error) {
        console.error("Failed to send shipping email:", error);
    }
};


// Helper to ensure initialization
const ensureInitialized = () => {
    if (window.emailjs && isConfigured()) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
}

// Initialize on load if possible, but safe
if (typeof emailjs !== 'undefined' && isConfigured()) {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch (e) { console.warn('EmailJS auto-init failed', e); }
}

