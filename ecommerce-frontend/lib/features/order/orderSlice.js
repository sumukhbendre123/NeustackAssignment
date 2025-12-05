import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        currentDiscount: null, // {code: string, discountAmount: number, valid: boolean}
        earnedDiscountCodes: [], // Discount codes earned from orders
        lastOrderId: null,
    },
    reducers: {
        // Set validated discount code
        setDiscount: (state, action) => {
            state.currentDiscount = action.payload
        },

        // Clear discount code
        clearDiscount: (state) => {
            state.currentDiscount = null
        },

        // Add a new order to history
        addOrder: (state, action) => {
            state.orders.push(action.payload)
            state.lastOrderId = action.payload.orderId
        },

        // Add earned discount code
        addEarnedDiscountCode: (state, action) => {
            if (action.payload && !state.earnedDiscountCodes.includes(action.payload)) {
                state.earnedDiscountCodes.push(action.payload)
            }
        },

        // Set all orders (for admin view)
        setOrders: (state, action) => {
            state.orders = action.payload
        },

        // Clear all orders and discount codes
        clearOrderHistory: (state) => {
            state.orders = []
            state.currentDiscount = null
            state.earnedDiscountCodes = []
            state.lastOrderId = null
        }
    }
})

export const {
    setDiscount,
    clearDiscount,
    addOrder,
    addEarnedDiscountCode,
    setOrders,
    clearOrderHistory
} = orderSlice.actions

export default orderSlice.reducer
