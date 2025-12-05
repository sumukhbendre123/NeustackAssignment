'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { CopyIcon, PlusIcon, RefreshCwIcon, TicketIcon } from "lucide-react"
import { getAdminStats, generateDiscountCode } from "@/lib/services/api"

export default function AdminCoupons() {

    const [discountCodes, setDiscountCodes] = useState([])
    const [stats, setStats] = useState({
        totalOrders: 0,
        orderCount: 0,
        totalDiscount: 0
    })
    const [loading, setLoading] = useState(false)

    const fetchDiscountCodes = async () => {
        try {
            setLoading(true)
            const data = await getAdminStats()
            setDiscountCodes(data.discountCodes || [])
            setStats({
                totalOrders: data.totalOrders,
                orderCount: data.orderCount,
                totalDiscount: data.totalDiscount
            })
        } catch (error) {
            console.error('Error fetching discount codes:', error)
            toast.error('Failed to load discount codes')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateCode = async (e) => {
        e.preventDefault()

        try {
            const result = await generateDiscountCode()

            if (result.success) {
                toast.success(`Generated: ${result.code}`)
                // Refresh the list
                await fetchDiscountCodes()
            } else {
                throw new Error(result.message || 'Failed to generate code')
            }
        } catch (error) {
            console.error('Error generating code:', error)
            throw error
        }
    }

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        toast.success('Code copied to clipboard!')
    }

    useEffect(() => {
        fetchDiscountCodes()
    }, [])

    return (
        <div className="text-slate-500 mb-40">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Discount <span className="text-slate-800 font-medium">Codes</span></h2>
                <button
                    onClick={() => toast.promise(fetchDiscountCodes(), {
                        loading: 'Refreshing...',
                        success: 'Codes refreshed!',
                        error: 'Failed to refresh'
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all text-sm"
                >
                    <RefreshCwIcon size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="border border-slate-200 rounded-lg p-5">
                    <p className="text-sm text-slate-500 mb-2">Total Discount Codes</p>
                    <p className="text-3xl font-bold text-slate-700">{discountCodes.length}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5">
                    <p className="text-sm text-slate-500 mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-slate-700">{stats.orderCount}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5">
                    <p className="text-sm text-slate-500 mb-2">Total Discount Given</p>
                    <p className="text-3xl font-bold text-green-600">${stats.totalDiscount.toFixed(2)}</p>
                </div>
            </div>

            {/* Generate Code Section */}
            <div className="max-w-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Generate New Discount Code</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Manually generate a discount code. Note: Codes are automatically generated every 3rd order.
                </p>
                <button
                    onClick={(e) => toast.promise(handleGenerateCode(e), {
                        loading: 'Generating code...',
                        success: (data) => 'Code generated successfully!',
                        error: (err) => err.message
                    })}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                >
                    <PlusIcon size={18} />
                    Generate Code
                </button>
            </div>

            {/* List Discount Codes */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">
                    All Discount Codes ({discountCodes.length})
                </h3>

                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400">Loading...</p>
                    </div>
                ) : discountCodes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {discountCodes.map((code, index) => (
                            <div
                                key={index}
                                className="bg-white border-2 border-slate-200 rounded-lg p-5 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <TicketIcon className="text-blue-600" size={24} />
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        10% OFF
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Discount Code</p>
                                        <p className="text-xl font-bold font-mono text-slate-800">{code}</p>
                                    </div>

                                    <button
                                        onClick={() => copyToClipboard(code)}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"
                                        title="Copy to clipboard"
                                    >
                                        <CopyIcon size={18} className="text-slate-600" />
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">Code #{index + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                        <TicketIcon className="mx-auto mb-3 text-slate-400" size={48} />
                        <p className="text-slate-500">No discount codes generated yet</p>
                        <p className="text-sm text-slate-400 mt-2">Generate your first code or place 3 orders to earn one</p>
                    </div>
                )}
            </div>

            {/* Information Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h4 className="font-semibold text-slate-700 mb-2">ℹ️ Discount Code Information</h4>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Each discount code provides 10% off the entire cart</li>
                    <li>Codes are automatically generated every 3rd order</li>
                    <li>Each code can be used only once</li>
                    <li>Codes do not expire</li>
                    <li>Customers receive their earned codes after checkout</li>
                </ul>
            </div>
        </div>
    )
}