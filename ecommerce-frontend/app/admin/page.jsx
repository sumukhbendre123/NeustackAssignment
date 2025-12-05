'use client'
import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { getAdminStats, getAllOrders } from "@/lib/services/api"
import { CircleDollarSignIcon, ShoppingBasketIcon, TicketIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalOrders: 0,
        totalItems: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        discountCodes: [],
        orderCount: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Items Sold', value: dashboardData.totalItems, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.totalRevenue.toFixed(2), icon: CircleDollarSignIcon },
        { title: 'Total Discount', value: currency + dashboardData.totalDiscount.toFixed(2), icon: TicketIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch statistics from backend
            const stats = await getAdminStats()
            const ordersData = await getAllOrders()

            setDashboardData({
                ...stats,
                allOrders: ordersData.orders || []
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast.error('Failed to load dashboard data')
            // Fallback to dummy data
            setDashboardData(dummyAdminDashboardData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>
                <button
                    onClick={() => toast.promise(fetchDashboardData(), {
                        loading: 'Refreshing...',
                        success: 'Dashboard refreshed!',
                        error: 'Failed to refresh'
                    })}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all text-sm"
                >
                    Refresh Data
                </button>
            </div>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Stats Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Orders Placed:</span>
                            <span className="font-semibold text-slate-700">{dashboardData.orderCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Orders with Discount:</span>
                            <span className="font-semibold text-slate-700">
                                {dashboardData.allOrders.filter(o => o.discount > 0).length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Next Discount at Order:</span>
                            <span className="font-semibold text-green-600">
                                #{dashboardData.orderCount + (3 - (dashboardData.orderCount % 3))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Discount Codes</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Generated:</span>
                            <span className="font-semibold text-slate-700">{dashboardData.discountCodes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount Percentage:</span>
                            <span className="font-semibold text-green-600">10%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Generate Every:</span>
                            <span className="font-semibold text-slate-700">3rd Order</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Area Chart */}
            {dashboardData.allOrders.length > 0 && (
                <OrdersAreaChart allOrders={dashboardData.allOrders} />
            )}
        </div>
    )
}