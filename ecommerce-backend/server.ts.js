/**
 * Unit Tests for E-commerce Backend
 */

const request = require('supertest');
const app = require('./server');

describe('E-commerce API Tests', () => {

    beforeEach(async () => {
        // Reset store before each test
        await request(app).post('/api/admin/reset');
    });

    describe('POST /api/checkout', () => {
        test('should successfully checkout without discount', async () => {
            const items = [
                { productId: '1', productName: 'Test Product', price: 100, quantity: 2 }
            ];

            const response = await request(app)
                .post('/api/checkout')
                .send({ items });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.total).toBe(200);
            expect(response.body.discount).toBe(0);
            expect(response.body.orderId).toBeDefined();
        });

        test('should fail checkout with empty cart', async () => {
            const response = await request(app)
                .post('/api/checkout')
                .send({ items: [] });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should generate discount code on 3rd order', async () => {
            const items = [
                { productId: '1', productName: 'Test Product', price: 100, quantity: 1 }
            ];

            // First order - no discount code
            let response = await request(app).post('/api/checkout').send({ items });
            expect(response.body.newDiscountCode).toBeUndefined();

            // Second order - no discount code
            response = await request(app).post('/api/checkout').send({ items });
            expect(response.body.newDiscountCode).toBeUndefined();

            // Third order - should get discount code
            response = await request(app).post('/api/checkout').send({ items });
            expect(response.body.newDiscountCode).toBeDefined();
            expect(response.body.newDiscountCode.length).toBe(8);
        });
    });

    describe('POST /api/validate-discount', () => {
        test('should validate generated discount code', async () => {
            // Generate a discount code
            const genResponse = await request(app)
                .post('/api/admin/generate-discount');

            const code = genResponse.body.code;

            // Validate it
            const response = await request(app)
                .post('/api/validate-discount')
                .send({ code, cartTotal: 100 });

            expect(response.status).toBe(200);
            expect(response.body.valid).toBe(true);
            expect(response.body.discountAmount).toBe(10); // 10% of 100
        });

        test('should reject invalid discount code', async () => {
            const response = await request(app)
                .post('/api/validate-discount')
                .send({ code: 'INVALID', cartTotal: 100 });

            expect(response.body.valid).toBe(false);
        });

        test('should reject used discount code', async () => {
            // Generate and use a code
            const genResponse = await request(app)
                .post('/api/admin/generate-discount');

            const code = genResponse.body.code;

            // Use it in checkout
            const items = [
                { productId: '1', productName: 'Test Product', price: 100, quantity: 1 }
            ];
            await request(app).post('/api/checkout').send({ items, discountCode: code });

            // Try to validate again
            const response = await request(app)
                .post('/api/validate-discount')
                .send({ code, cartTotal: 100 });

            expect(response.body.valid).toBe(false);
            expect(response.body.message).toContain('already been used');
        });
    });

    describe('POST /api/admin/generate-discount', () => {
        test('should generate a valid discount code', async () => {
            const response = await request(app)
                .post('/api/admin/generate-discount');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.code).toBeDefined();
            expect(response.body.code.length).toBe(8);
        });
    });

    describe('GET /api/admin/stats', () => {
        test('should return correct statistics', async () => {
            // Place some orders
            const items = [
                { productId: '1', productName: 'Test Product', price: 100, quantity: 2 }
            ];

            await request(app).post('/api/checkout').send({ items });
            await request(app).post('/api/checkout').send({ items });

            const response = await request(app).get('/api/admin/stats');

            expect(response.status).toBe(200);
            expect(response.body.totalOrders).toBe(2);
            expect(response.body.totalItems).toBe(4);
            expect(response.body.totalRevenue).toBe(400);
        });

        test('should track discount usage', async () => {
            // Generate discount
            const genResponse = await request(app)
                .post('/api/admin/generate-discount');

            const code = genResponse.body.code;

            // Use discount
            const items = [
                { productId: '1', productName: 'Test Product', price: 100, quantity: 1 }
            ];
            await request(app).post('/api/checkout').send({ items, discountCode: code });

            const response = await request(app).get('/api/admin/stats');

            expect(response.body.totalDiscount).toBe(10);
            expect(response.body.discountCodes).toContain(code);
        });
    });
});