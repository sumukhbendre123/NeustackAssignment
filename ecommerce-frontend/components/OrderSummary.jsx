import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { validateDiscount, checkout } from '@/lib/services/api';
import { setDiscount, clearDiscount, addOrder, addEarnedDiscountCode } from '@/lib/features/order/orderSlice';
import { clearCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);
    const currentDiscount = useSelector(state => state.order.currentDiscount);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCouponCode = async (event) => {
        event.preventDefault();

        if (!couponCodeInput.trim()) {
            throw new Error('Please enter a coupon code');
        }

        const result = await validateDiscount(couponCodeInput.trim().toUpperCase(), totalPrice);

        if (result.valid) {
            dispatch(setDiscount({
                code: couponCodeInput.trim().toUpperCase(),
                discountAmount: result.discountAmount,
                valid: true
            }));
            setCouponCodeInput('');
            toast.success(result.message || 'Discount code applied!');
        } else {
            throw new Error(result.message || 'Invalid discount code');
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!selectedAddress) {
            throw new Error('Please select a delivery address');
        }

        if (isProcessing) return;

        setIsProcessing(true);

        try {
            // Transform cart items to match backend API format
            const orderItems = items.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity
            }));

            // Call checkout API
            const result = await checkout(orderItems, currentDiscount?.code || null);

            if (result.success) {
                // Save order to Redux store
                dispatch(addOrder({
                    orderId: result.orderId,
                    items: orderItems,
                    total: result.total,
                    discount: result.discount,
                    discountCode: currentDiscount?.code || null,
                    timestamp: new Date().toISOString(),
                    address: selectedAddress,
                    paymentMethod
                }));

                // If a new discount code was earned, save it
                if (result.newDiscountCode) {
                    dispatch(addEarnedDiscountCode(result.newDiscountCode));
                }

                // Clear cart and discount
                dispatch(clearCart());
                dispatch(clearDiscount());

                toast.success(result.message || 'Order placed successfully!');

                // Redirect to orders page
                setTimeout(() => {
                    router.push('/orders');
                }, 1000);
            } else {
                throw new Error(result.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }

    const discountAmount = currentDiscount ? currentDiscount.discountAmount : 0;
    const finalTotal = totalPrice - discountAmount;

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {currentDiscount && <p>Discount:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {currentDiscount && <p className='text-green-600'>-{currency}{discountAmount.toFixed(2)}</p>}
                    </div>
                </div>
                {
                    !currentDiscount ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), {
                            loading: 'Validating coupon...',
                            success: (data) => 'Coupon applied successfully!',
                            error: (err) => err.message
                        })} className='flex justify-center gap-3 mt-3'>
                            <input
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                value={couponCodeInput}
                                type="text"
                                placeholder='Enter Coupon Code'
                                className='border border-slate-400 p-1.5 rounded w-full outline-none uppercase'
                            />
                            <button
                                type="submit"
                                className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'
                            >
                                Apply
                            </button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2 bg-green-50 p-2 rounded'>
                            <p>Code: <span className='font-semibold ml-1'>{currentDiscount.code}</span></p>
                            <p className='text-green-700'>10% OFF</p>
                            <XIcon
                                size={18}
                                onClick={() => dispatch(clearDiscount())}
                                className='hover:text-red-700 transition cursor-pointer'
                            />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{finalTotal.toFixed(2)}</p>
            </div>
            <button
                onClick={e => toast.promise(handlePlaceOrder(e), {
                    loading: 'Placing order...',
                    success: (data) => 'Order placed successfully!',
                    error: (err) => err.message
                })}
                disabled={isProcessing}
                className={`w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isProcessing ? 'Processing...' : 'Place Order'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary