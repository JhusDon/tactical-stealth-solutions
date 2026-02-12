import { db } from "./firebase-config.js";
import { collection, serverTimestamp, runTransaction, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Submit an order to Firestore using a transaction to ensure stock availability.
 * @param {Object} orderDetails - The order information (must include items array with {id, qty})
 * @returns {Promise<string>} - The ID of the created order document
 * @throws {Error} - If stock is insufficient
 */

export async function submitOrder(orderData) {
    try {
        const orderRef = doc(collection(db, "orders")); // Generate ID first

        await runTransaction(db, async (transaction) => {
            // 1. Read all inventory items first (Read operations must come before Write operations)
            const inventoryReads = [];
            for (const item of orderData.items) {
                // Assuming item.id matches the inventory doc ID (e.g., 'ghost_cap')
                // If item.id is not the doc ID, we need a mapping. 
                // Based on admin.html, products have IDs like 'ghost_cap', 'audio_ext'.
                // checkout.html saves items with 'id' property.
                const sfDocRef = doc(db, "inventory", item.id);
                inventoryReads.push({ ref: sfDocRef, qty: item.qty, name: item.name });
            }

            const inventoryDocs = await Promise.all(inventoryReads.map(i => transaction.get(i.ref)));

            // 2. Check Stock Availability
            inventoryDocs.forEach((docSnapshot, index) => {
                const requestedQty = inventoryReads[index].qty;
                const itemName = inventoryReads[index].name;

                if (!docSnapshot.exists()) {
                    throw "Product [" + itemName + "] not found in inventory system.";
                }

                const currentStock = docSnapshot.data().qty || 0;
                if (currentStock < requestedQty) {
                    throw "Insufficient stock for: " + itemName + ". Available: " + currentStock;
                }
            });

            // 3. Perform Writes (Decrement Stock + Create Order)
            inventoryDocs.forEach((docSnapshot, index) => {
                const newQty = docSnapshot.data().qty - inventoryReads[index].qty;
                transaction.update(inventoryReads[index].ref, { qty: newQty });
            });

            transaction.set(orderRef, {
                ...orderData,
                timestamp: serverTimestamp(),
                status: "paid" // Should be 'pending' until verified? checkout.html calls this AFTER payment.
                // checkout.html says: details = await actions.order.capture(); -> submitOrder
                // So payment is already captured at PayPal side. Status 'paid' is correct.
            });
        });

        console.log("Transaction successfully committed! Order ID: ", orderRef.id);
        return orderRef.id;

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e; // Propagate error to checkout.html to show alert
    }
}
