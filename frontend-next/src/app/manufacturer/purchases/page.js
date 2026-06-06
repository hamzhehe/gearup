"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getApiBaseUrl } from '@/lib/api';
import Skeleton from '@/components/common/Skeleton';
import { isOrderInTimeRange } from '@/lib/dashboardUtils';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { formatPKR, formatPKRShort } from '@/lib/financeUtils';
import { Download, ShoppingCart, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';

export default function PurchasesPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('6months');

    const fetchPurchasesData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter to only purchases (user is buyer)
                const purchases = data.data.filter(o => o.buyer?._id === user?.id || o.buyer === user?.id || o.buyer?._id === user?._id);
                setOrders(purchases);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?._id]);

    useEffect(() => {
        if (user) {
            fetchPurchasesData();
        }
    }, [fetchPurchasesData, user]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => isOrderInTimeRange(o.createdAt, timeFilter));
    }, [orders, timeFilter]);

    const stats = useMemo(() => {
        const totalSpent = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPurchases = filteredOrders.length;
        const pendingPurchases = filteredOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const uniqueSuppliers = new Set(filteredOrders.map(o => o.seller?._id || o.seller)).size;

        return { totalSpent, totalPurchases, pendingPurchases, uniqueSuppliers };
    }, [filteredOrders]);

    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dataMap = {};
        
        filteredOrders.forEach(o => {
            const date = new Date(o.createdAt);
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (!dataMap[key]) dataMap[key] = { name: key, spent: 0 };
            dataMap[key].spent += (o.totalAmount || 0);
        });

        return Object.values(dataMap);
    }, [filteredOrders]);

    if (loading) {
        return (
                <div className="flex flex-col gap-6 w-full p-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                        <div>
                            <Skeleton variant="text" className="w-64 h-10 mb-2" />
                            <Skeleton variant="text" className="w-96 h-5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} variant="stat" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start w-full">
                        <div className="xl:col-span-3 space-y-6 w-full">
                            <Skeleton variant="card" className="h-[400px]" />
                            <Skeleton variant="table" rows={5} />
                        </div>
                        <div className="space-y-6 w-full">
                            <Skeleton variant="card" className="h-[200px]" />
                        </div>
                    </div>
                </div>
        );
    }

    return (
            <div className="flex flex-col gap-6 w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6 mb-2 text-center sm:text-left">
                    <div>
                        <h1 className="font-sans text-3xl font-semibold text-slate-900 tracking-tight">Purchases & Procurement</h1>
                        <p className="font-sans text-[14px] font-medium text-slate-500 mt-1.5">Manage purchase orders and track supplier spending.</p>
                    </div>
                    <div className="flex justify-center sm:justify-end">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-sans font-semibold text-[13px] transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer hover:-translate-y-0.5">
                            <Download size={16} /> Export Data
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
                    {[
                        { label: 'Total Spent', value: formatPKR(stats.totalSpent), icon: ShoppingCart, color: 'text-blue-700', bg: 'bg-blue-100' },
                        { label: 'Total Purchases', value: stats.totalPurchases, icon: ShoppingBag, color: 'text-indigo-700', bg: 'bg-indigo-100' },
                        { label: 'Pending Orders', value: stats.pendingPurchases, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
                        { label: 'Active Suppliers', value: stats.uniqueSuppliers, icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-100' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                                    <stat.icon size={18} className="stroke-[2.5]" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</div>
                                <div className="font-sans text-2xl font-bold text-slate-900">{loading ? '-' : stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start w-full">
                    
                    {/* Left 3 Columns: Controls, Chart, and Table */}
                    <div className="xl:col-span-3 flex flex-col gap-6 min-w-0 w-full">
                        
                        {/* Control Panel: Filters */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
                                {/* Time Filter */}
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 flex-1 md:flex-initial shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors focus-within:border-emerald-500 focus-within:ring-[3px] focus-within:ring-emerald-500/10 w-full md:w-auto">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-3">Period</span>
                                    <select 
                                        value={timeFilter} 
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="bg-transparent text-slate-900 font-sans text-[13px] font-semibold outline-none cursor-pointer w-full appearance-none"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="6months">Last 6 Months</option>
                                        <option value="year">This Year</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <h3 className="font-sans text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-6">Monthly Procurement Cost</h3>
                            <div className="w-full h-[300px]">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontFamily: 'inherit'}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} width={100} tick={{fill: '#64748B', fontSize: 11, fontFamily: 'inherit'}} tickFormatter={(val) => formatPKRShort(val)} />
                                            <RechartsTooltip 
                                                cursor={{fill: '#F8FAFC'}}
                                                contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold'}}
                                                formatter={(value) => [formatPKR(value), 'Spent']}
                                            />
                                            <Bar dataKey="spent" fill="#0f172a" radius={[6, 6, 0, 0]} maxBarSize={45} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-sans text-[13px] font-medium">No purchase data for this period</div>
                                )}
                            </div>
                        </div>

                        {/* Purchases History Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                <h4 className="font-sans text-[13px] font-bold text-slate-900 uppercase tracking-wider">Recent Purchase Orders</h4>
                            </div>
                            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                <table className="w-full min-w-[800px] text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/80">
                                            <th className="px-6 py-4 font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">PO Number</th>
                                            <th className="px-6 py-4 font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">Supplier</th>
                                            <th className="px-6 py-4 font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredOrders.slice(0, 10).map((order) => (
                                            <tr key={order._id} className="hover:bg-slate-50/60 transition-all duration-200 group">
                                                <td className="px-6 py-5 whitespace-nowrap align-top">
                                                    <div className="font-sans font-bold text-[14px] text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top">
                                                    <div className="font-mono text-[11px] text-slate-500 font-medium mt-1.5">
                                                        {new Date(order.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top">
                                                    <div className="font-sans text-[14px] font-semibold text-slate-900 line-clamp-1 max-w-[150px]" title={order.seller?.businessName || order.seller?.name}>
                                                        {order.seller?.businessName || order.seller?.name || 'Unknown Supplier'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top whitespace-nowrap">
                                                    <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border inline-block ${
                                                        order.status === 'delivered' || order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                        {order.status === 'completed' ? 'Delivered' : order.status === 'delivered' ? 'Delivered' : order.status === 'processing' ? 'Pending Approval' : order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top font-sans text-[14px] font-bold text-slate-900 whitespace-nowrap text-right">
                                                    {formatPKR(order.totalAmount)}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium font-sans text-[13px]">No purchases found for this period.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Column: Insights */}
                    <div className="flex flex-col gap-6 min-w-0 w-full">
                        {/* Supplier Concentration Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <ShieldCheck size={16} className="stroke-[2.5]" />
                                </div>
                                <h4 className="font-sans text-[13px] font-bold text-slate-900 uppercase tracking-wider">Supplier Concentration</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                    <span className="font-sans text-[12px] font-medium text-slate-600">Total Suppliers Used</span>
                                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md text-[11px]">{stats.uniqueSuppliers}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                    <span className="font-sans text-[12px] font-medium text-slate-600">Top Supplier Dependency</span>
                                    <span className="text-amber-600 font-bold font-sans text-[13px]">42%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-sans text-[12px] font-medium text-slate-600">Avg Lead Time</span>
                                    <span className="text-emerald-600 font-bold font-sans text-[13px]">4.2 Days</span>
                                </div>
                            </div>
                        </div>

                        {/* Procurement Insight */}
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[60px] -mr-24 -mt-24 rounded-full pointer-events-none"></div>
                            <h4 className="font-sans text-[13px] font-bold text-white uppercase tracking-wider mb-3 relative z-10">Procurement Insight</h4>
                            <p className="font-sans text-[12px] text-slate-300 font-medium leading-relaxed relative z-10">
                                You have <span className="text-blue-400 font-bold">{stats.pendingPurchases} pending orders</span> awaiting supplier approval. Consolidating future orders may qualify you for higher bulk discounts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}
