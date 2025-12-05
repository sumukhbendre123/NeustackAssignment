/**
 * E-commerce Backend Server
 * 
 * Features:
 * - Add items to cart
 * - Checkout with discount code validation
 * - Admin APIs for discount generation and statistics
 * 
 * Every Nth order gets a discount code for 10% off
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const NTH_ORDER_FOR_DISCOUNT = 3; // Every 3rd order gets a discount
const DISCOUNT_PERCENTAGE = 10; // 10% discount

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
const store = {
    orders: [],
    discountCodes: new Map(), // code -> { isUsed: boolean, generatedAt: timestamp }
    orderCount: 0
};

/**
 * Utility: Generate a random discount code
 */
function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

/**
 * Utility: Calculate discount amount
 */
function calculateDiscount(cartTotal) {
    return (cartTotal * DISCOUNT_PERCENTAGE) / 100;
}

/**
 * API: Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * API: Validate discount code
 * POST /api/validate-discount
 * Body: { code: string, cartTotal: number }
 */
app.post('/api/validate-discount', (req, res) => {
    const { code, cartTotal } = req.body;

    // Validation
    if (!code || typeof cartTotal !== 'number') {
        return res.status(400).json({
            valid: false,
            message: 'Invalid request parameters'
        });
    }

    // Check if code exists
    const discountInfo = store.discountCodes.get(code);

    if (!discountInfo) {
        return res.json({
            valid: false,
            message: 'Invalid discount code'
        });
    }

    // Check if code is already used
    if (discountInfo.isUsed) {
        return res.json({
            valid: false,
            message: 'This discount code has already been used'
        });
    }

    // Calculate discount amount
    const discountAmount = calculateDiscount(cartTotal);

    res.json({
        valid: true,
        discountAmount,
        message: 'Discount code is valid'
    });
});

/**
 * API: Checkout
 * POST /api/checkout
 * Body: { items: Array<{productId, productName, price, quantity}>, discountCode?: string }
 */
app.post('/api/checkout', (req, res) => {
    const { items, discountCode } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Cart is empty or invalid'
        });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    let discount = 0;
    let usedDiscountCode = null;

    // Apply discount if code provided
    if (discountCode) {
        const discountInfo = store.discountCodes.get(discountCode);

        if (!discountInfo) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount code'
            });
        }

        if (discountInfo.isUsed) {
            return res.status(400).json({
                success: false,
                message: 'Discount code has already been used'
            });
        }

        // Mark discount as used
        discountInfo.isUsed = true;
        discount = calculateDiscount(subtotal);
        usedDiscountCode = discountCode;
    }

    const total = subtotal - discount;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Increment order count
    store.orderCount++;

    // Create order
    const order = {
        orderId: uuidv4(),
        items,
        subtotal,
        discount,
        total,
        totalItems,
        discountCode: usedDiscountCode,
        timestamp: new Date().toISOString()
    };

    store.orders.push(order);

    // Check if this order qualifies for a new discount code
    let newDiscountCode = null;
    if (store.orderCount % NTH_ORDER_FOR_DISCOUNT === 0) {
        newDiscountCode = generateCode();
        store.discountCodes.set(newDiscountCode, {
            isUsed: false,
            generatedAt: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        orderId: order.orderId,
        total: order.total,
        discount: order.discount,
        newDiscountCode,
        message: newDiscountCode
            ? `Order placed! You've earned discount code: ${newDiscountCode}`
            : 'Order placed successfully'
    });
});

/**
 * ADMIN API: Generate discount code manually
 * POST /api/admin/generate-discount
 */
app.post('/api/admin/generate-discount', (req, res) => {
    const code = generateCode();
    store.discountCodes.set(code, {
        isUsed: false,
        generatedAt: new Date().toISOString()
    });

    res.json({
        success: true,
        code,
        message: 'Discount code generated successfully'
    });
});

/**
 * ADMIN API: Get statistics
 * GET /api/admin/stats
 */
app.get('/api/admin/stats', (req, res) => {
    // Calculate statistics
    const totalOrders = store.orders.length;

    const totalItems = store.orders.reduce((sum, order) => {
        return sum + order.totalItems;
    }, 0);

    const totalRevenue = store.orders.reduce((sum, order) => {
        return sum + order.total;
    }, 0);

    const totalDiscount = store.orders.reduce((sum, order) => {
        return sum + order.discount;
    }, 0);

    const discountCodes = Array.from(store.discountCodes.keys());

    res.json({
        totalOrders,
        totalItems,
        totalRevenue,
        totalDiscount,
        discountCodes,
        orderCount: store.orderCount
    });
});

/**
 * ADMIN API: Get all orders
 * GET /api/admin/orders
 */
app.get('/api/admin/orders', (req, res) => {
    res.json({
        orders: store.orders,
        count: store.orders.length
    });
});

/**
 * ADMIN API: Reset store (for testing)
 * POST /api/admin/reset
 */
app.post('/api/admin/reset', (req, res) => {
    store.orders = [];
    store.discountCodes.clear();
    store.orderCount = 0;

    res.json({
        success: true,
        message: 'Store reset successfully'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 E-commerce backend running on http://localhost:${PORT}`);
    console.log(`📊 Discount: Every ${NTH_ORDER_FOR_DISCOUNT} orders gets ${DISCOUNT_PERCENTAGE}% off`);
});

module.exports = app; // For testing