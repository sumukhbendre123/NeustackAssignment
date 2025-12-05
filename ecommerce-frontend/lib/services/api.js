/**
 * API Service for E-commerce Backend
 * 
 * This service handles all communication with the backend API
 * running on http://localhost:3001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Validate a discount code
 * @param {string} code - The discount code to validate
 * @param {number} cartTotal - The total cart amount
 * @returns {Promise<{valid: boolean, discountAmount?: number, message: string}>}
 */
export const validateDiscount = async (code, cartTotal) => {
    try {
        const response = await fetch(`${API_BASE_URL}/validate-discount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, cartTotal }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating discount:', error);
        return {
            valid: false,
            message: 'Failed to validate discount code'
        };
    }
};

/**
 * Checkout and place an order
 * @param {Array} items - Array of cart items {productId, productName, price, quantity}
 * @param {string} discountCode - Optional discount code to apply
 * @returns {Promise<{success: boolean, orderId?: string, total?: number, discount?: number, newDiscountCode?: string, message: string}>}
 */
export const checkout = async (items, discountCode = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items, discountCode }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Checkout failed');
        }

        return data;
    } catch (error) {
        console.error('Error during checkout:', error);
        return {
            success: false,
            message: error.message || 'Failed to place order'
        };
    }
};

/**
 * Get admin statistics
 * @returns {Promise<{totalOrders: number, totalItems: number, totalRevenue: number, totalDiscount: number, discountCodes: Array<string>, orderCount: number}>}
 */
export const getAdminStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
            totalOrders: 0,
            totalItems: 0,
            totalRevenue: 0,
            totalDiscount: 0,
            discountCodes: [],
            orderCount: 0
        };
    }
};

/**
 * Get all orders
 * @returns {Promise<{orders: Array, count: number}>}
 */
export const getAllOrders = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            orders: [],
            count: 0
        };
    }
};

/**
 * Generate a new discount code (Admin only)
 * @returns {Promise<{success: boolean, code?: string, message: string}>}
 */
export const generateDiscountCode = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/generate-discount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating discount code:', error);
        return {
            success: false,
            message: 'Failed to generate discount code'
        };
    }
};

/**
 * Reset the store (Admin only - for testing)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resetStore = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resetting store:', error);
        return {
            success: false,
            message: 'Failed to reset store'
        };
    }
};

/**
 * Health check endpoint
 * @returns {Promise<{status: string, timestamp: string}>}
 */
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking health:', error);
        return {
            status: 'error',
            timestamp: new Date().toISOString()
        };
    }
};
