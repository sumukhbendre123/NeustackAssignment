# E-commerce Store with Discount System

A full-stack e-commerce application with automatic discount code generation for every Nth order.

## Demo Video


https://github.com/user-attachments/assets/dc5880e6-e74a-41c1-bada-e910c5770491



## Features

### Customer Features

- Browse products
- Add/remove items from cart
- Apply discount codes
- Checkout and place orders
- Automatic discount code generation on qualifying orders

### Admin Features

- View total orders and items purchased
- Track total revenue and discount amounts
- View all generated discount codes
- Manually generate discount codes

## Tech Stack

### Frontend

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **UUID** - Order ID generation
- **Jest & Supertest** - Testing

## Installation & Setup

### Backend

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

4. Run tests:

```bash
npm test
```

### Frontend

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### 1. Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Validate Discount Code

```http
POST /api/validate-discount
Content-Type: application/json

{
  "code": "ABC12345",
  "cartTotal": 100.00
}
```

Response:

```json
{
  "valid": true,
  "discountAmount": 10.0,
  "message": "Discount code is valid"
}
```

#### 3. Checkout

```http
POST /api/checkout
Content-Type: application/json

{
  "items": [
    {
      "productId": "1",
      "productName": "Wireless Headphones",
      "price": 79.99,
      "quantity": 2
    }
  ],
  "discountCode": "ABC12345"
}
```

Response:

```json
{
  "success": true,
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 143.98,
  "discount": 15.99,
  "newDiscountCode": "XYZ78901",
  "message": "Order placed! You've earned discount code: XYZ78901"
}
```

#### 4. Generate Discount Code (Admin)

```http
POST /api/admin/generate-discount
```

Response:

```json
{
  "success": true,
  "code": "NEWCODE1",
  "message": "Discount code generated successfully"
}
```

#### 5. Get Statistics (Admin)

```http
GET /api/admin/stats
```

Response:

```json
{
  "totalOrders": 15,
  "totalItems": 32,
  "totalRevenue": 1250.75,
  "totalDiscount": 125.5,
  "discountCodes": ["CODE1", "CODE2", "CODE3"],
  "orderCount": 15
}
```

#### 6. Get All Orders (Admin)

```http
GET /api/admin/orders
```

#### 7. Reset Store (Admin - Testing)

```http
POST /api/admin/reset
```

## Configuration

Edit `server.js` to modify:

```javascript
const NTH_ORDER_FOR_DISCOUNT = 3; // Every 3rd order gets a discount
const DISCOUNT_PERCENTAGE = 10; // 10% discount
```

## Testing

### Run Unit Tests

```bash
cd backend
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

### Manual Testing with cURL

1. Place an order:

```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "1", "productName": "Test", "price": 100, "quantity": 1}
    ]
  }'
```

2. Generate discount code:

```bash
curl -X POST http://localhost:3001/api/admin/generate-discount
```

3. Get statistics:

```bash
curl http://localhost:3001/api/admin/stats
```

## Architecture Decisions

### In-Memory Storage

- Fast and simple for demonstration
- Suitable for prototype/MVP
- Data resets on server restart
- For production: Use PostgreSQL/MongoDB

### Discount Logic

- Automatic generation every Nth order
- One-time use per code
- 10% off entire cart
- Admin can manually generate codes

### API Design

- RESTful principles
- JSON request/response
- Proper HTTP status codes
- Error handling middleware

## Future Enhancements

- [ ] Persistent database (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Order history per user
- [ ] Multiple discount tiers
- [ ] Expiring discount codes
- [ ] Email notifications
- [ ] Payment integration
- [ ] Inventory management

## Author

Sumukh Bendre
