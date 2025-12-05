'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { useSelector } from "react-redux";
import { format } from 'date-fns';
import { GiftIcon, TicketIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function Orders() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const orders = useSelector(state => state.order.orders);
    const earnedDiscountCodes = useSelector(state => state.order.earnedDiscountCodes);

    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Discount code copied!');
    };

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                <div className="my-20 max-w-7xl mx-auto">
                    <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                    {/* Earned Discount Codes Section */}
                    {earnedDiscountCodes.length > 0 && (
                        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GiftIcon className="text-green-600" size={24} />
                                <h3 className="text-xl font-semibold text-slate-700">Your Earned Discount Codes</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {earnedDiscountCodes.map((code, index) => (
                                    <div
                                        key={index}
                                        onClick={() => copyToClipboard(code)}
                                        className="flex items-center gap-2 bg-white border-2 border-green-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-green-50 transition-all active:scale-95"
                                    >
                                        <TicketIcon className="text-green-600" size={18} />
                                        <span className="font-mono font-bold text-green-700">{code}</span>
                                        <span className="text-xs text-green-600">Click to copy</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 mt-3">🎉 Use these codes for 10% off on your next order!</p>
                        </div>
                    )}

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-slate-500">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-sm text-slate-600">
                                        <th className="text-left p-4">Order ID</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-center p-4">Items</th>
                                        <th className="text-center p-4">Discount</th>
                                        <th className="text-center p-4">Total</th>
                                        <th className="text-center p-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order.orderId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {order.orderId.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {format(new Date(order.timestamp), 'MMM dd, yyyy')}
                                                <br />
                                                <span className="text-xs text-slate-400">
                                                    {format(new Date(order.timestamp), 'hh:mm a')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {order.discount > 0 ? (
                                                    <span className="text-green-600 font-medium">
                                                        -{currency}{order.discount.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-semibold text-slate-700">
                                                {currency}{order.total.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    {expandedOrderId === order.orderId ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                    )).concat(
                                        expandedOrderId && orders.find(o => o.orderId === expandedOrderId) ? (
                                            <tr key={`details-${expandedOrderId}`}>
                                                <td colSpan="6" className="p-4 bg-slate-50">
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-slate-700">Order Items:</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {orders.find(o => o.orderId === expandedOrderId).items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between bg-white p-3 rounded border border-slate-200">
                                                                    <div>
                                                                        <p className="font-medium text-slate-700">{item.productName}</p>
                                                                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="font-medium text-slate-700">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {orders.find(o => o.orderId === expandedOrderId).address && (
                                                            <div>
                                                                <h4 className="font-semibold text-slate-700 mb-2">Delivery Address:</h4>
                                                                <p className="text-sm text-slate-600">
                                                                    {orders.find(o => o.orderId === expandedOrderId).address.name},
                                                                    {orders.find(o => o.orderId === expandedOrderId).address.city},
                                                                    {orders.find(o => o.orderId === expandedOrderId).address.state} -
                                                                    {orders.find(o => o.orderId === expandedOrderId).address.zip}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {orders.find(o => o.orderId === expandedOrderId).discountCode && (
                                                            <div>
                                                                <h4 className="font-semibold text-slate-700">Discount Code Used:</h4>
                                                                <span className="inline-block mt-1 bg-green-100 text-green-700 px-3 py-1 rounded font-mono text-sm">
                                                                    {orders.find(o => o.orderId === expandedOrderId).discountCode}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : []
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-4xl font-semibold mb-4">You have no orders</h1>
                        <p className="text-slate-500">Start shopping to see your orders here!</p>
                    </div>
                </div>
            )}
        </div>
    )
}