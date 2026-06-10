"use client";

import { getApiBaseUrl } from '@/lib/api';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Banknote,
    Download,
    Clock,
    Wallet,
    CreditCard,
    History,
    Search,
    ChevronRight,
    Filter,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Inbox
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Skeleton from '@/components/common/Skeleton';
import { formatPKR } from '@/lib/financeUtils';
import DisputeResolutionCard from '@/components/disputes/DisputeResolutionCard';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const ManufacturerTransactionsPage = () => {
    const { user } = useAuth();
    const router = useRouter();

    const [transactions, setTransactions] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [escrows, setEscrows] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [sellerDisputes, setSellerDisputes] = useState([]);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [methodFilter, setMethodFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchTransactions = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            
            const token = localStorage.getItem('token');
            const [res, walletRes, escrowRes, ledgerRes, disputesRes] = await Promise.all([
                fetch(`${getApiBaseUrl()}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${getApiBaseUrl()}/api/wallet/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${getApiBaseUrl()}/api/wallet/escrows`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${getApiBaseUrl()}/api/wallet/ledger`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${getApiBaseUrl()}/api/disputes/seller`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const data = await res.json();
            const walletData = await walletRes.json();
            const escrowData = await escrowRes.json();
            const ledgerData = await ledgerRes.json();
            const disputesData = await disputesRes.json();
            if (walletData.success) setWallet(walletData.data);
            if (disputesData.success) {
                setSellerDisputes(disputesData.data || []);
            } else {
                console.error('[seller] disputes fetch:', disputesData.error);
            }
            if (escrowData.success) setEscrows(escrowData.data);
            if (ledgerData.success) setLedger(ledgerData.data);
            if (data.success) {
                const mappedTransactions = data.data.map(order => {
                    const sellerId = user?.id || user?._id;
                    const myStat = order.sellerStats?.find(s => s.seller?._id === sellerId || s.seller === sellerId);
                    
                    return {
                        _id: order._id,
                        order: { _id: order._id },
                        wholesalerName: order.buyer?.businessDetails?.businessName || order.buyer?.name || 'Unknown Buyer',
                        receivedAmount: myStat ? myStat.sellerReceivable : order.totalAmount,
                        totalAmount: order.totalAmount,
                        paymentMethod: order.paymentMethod || 'Bank Transfer',
                        status: order.paymentStatus || 'Pending',
                        timestamp: order.createdAt || new Date().toISOString()
                    };
                });
                setTransactions(mappedTransactions);
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const getStatusBadge = (status) => {
        const lower = status.toLowerCase();
        if (lower === 'completed' || lower === 'paid') return 'text-emerald-700 bg-emerald-100 border-emerald-200';
        if (lower.includes('pending')) return 'text-amber-700 bg-amber-100 border-amber-200';
        if (lower === 'failed') return 'text-rose-700 bg-rose-100 border-rose-200';
        if (lower === 'refunded') return 'text-slate-700 bg-slate-100 border-slate-200';
        return 'text-blue-700 bg-blue-100 border-blue-200';
    };

    // Calculate KPIs
    const totalAmount = transactions.reduce((sum, t) => sum + (t.receivedAmount || t.totalAmount || 0), 0);
    const successfulAmount = transactions.filter(t => t.status.toLowerCase() === 'completed' || t.status.toLowerCase() === 'paid').reduce((sum, t) => sum + (t.receivedAmount || t.totalAmount || 0), 0);
    const pendingAmount = transactions.filter(t => t.status.toLowerCase().includes('pending')).reduce((sum, t) => sum + (t.receivedAmount || t.totalAmount || 0), 0);
    const failedAmount = transactions.filter(t => t.status.toLowerCase() === 'failed').reduce((sum, t) => sum + (t.receivedAmount || t.totalAmount || 0), 0);

    // Unique Payment Methods for Filter
    const paymentMethods = useMemo(() => {
        const methods = new Set(transactions.map(t => t.paymentMethod).filter(Boolean));
        return ['All', ...Array.from(methods)];
    }, [transactions]);

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.order?._id && t.order._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (t.wholesalerName && t.wholesalerName.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesMethod = methodFilter === 'All' || t.paymentMethod === methodFilter;
            
            let matchesDate = true;
            if (dateFilter !== 'All Time') {
                const txnDate = new Date(t.timestamp);
                const now = new Date();
                const daysDiff = (now - txnDate) / (1000 * 60 * 60 * 24);
                if (dateFilter === 'Last 7 Days') matchesDate = daysDiff <= 7;
                if (dateFilter === 'Last 30 Days') matchesDate = daysDiff <= 30;
            }

            return matchesSearch && matchesStatus && matchesMethod && matchesDate;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [transactions, searchQuery, statusFilter, methodFilter, dateFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Recent Activity
    const recentActivity = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    const handleWithdraw = async () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount <= 0) {
            alert('Enter a valid amount');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/wallet/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Withdrawal recorded (prototype only).');
                setWithdrawAmount('');
                fetchTransactions(true);
            } else {
                alert(data.error || 'Withdrawal failed');
            }
        } catch {
            alert('Connection error');
        }
    };

    const handleExport = () => {
        const headers = ['Transaction ID', 'Buyer Name', 'Amount (PKR)', 'Payment Method', 'Status', 'Date'];
        const csvRows = [headers.join(',')];

        filteredTransactions.forEach(t => {
            const row = [
                t._id,
                `"${t.wholesalerName || 'Unknown Buyer'}"`,
                t.receivedAmount || t.totalAmount || 0,
                t.paymentMethod || 'N/A',
                t.status,
                `"${new Date(t.timestamp).toLocaleString()}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'payments_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="space-y-8 w-full animate-in fade-in duration-300 pb-10">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mb-2"></div>
                        <div className="h-4 w-72 bg-slate-200 animate-pulse rounded-lg"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="stat" />)}
                </div>
                <div className="w-full"><Skeleton variant="table" rows={6} /></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full animate-in fade-in duration-500 pb-10">
            {/* Dummy wallet overview */}
            {wallet && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)] sm:col-span-2">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Wallet balance</p>
                        <p className="font-heading text-3xl font-black text-emerald-600 mt-2">PKR {(wallet.balance ?? 0).toLocaleString()}</p>
                        <p className="font-body text-[10px] text-slate-500 mt-1">Pay at checkout, receive sales after delivery, withdraw from here</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Pending escrow</p>
                        <p className="font-heading text-2xl font-black text-amber-600 mt-2">PKR {(wallet.escrowBalance || 0).toLocaleString()}</p>
                        <p className="font-body text-[10px] text-slate-500 mt-1">Unlocks to wallet when you deliver</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Total Earnings</p>
                        <p className="font-heading text-2xl font-black text-slate-900 mt-2">PKR {(wallet.totalEarnings || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Total Transactions</p>
                        <p className="font-heading text-2xl font-black text-slate-900 mt-2">{ledger.length}</p>
                    </div>
                </div>
            )}

            {escrows.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                    <div className="px-6 py-4 border-b border-[#E7ECF3]">
                        <h3 className="font-heading text-sm font-black text-slate-900 uppercase tracking-wider">Escrow Holdings</h3>
                        <p className="font-body text-[10px] text-slate-500 mt-1">Funds are secured by the platform and released after the buyer confirms delivery.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8FAFC]">
                                <tr>
                                    <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-400">Order</th>
                                    <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-400">Buyer</th>
                                    <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-400">Amount</th>
                                    <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {escrows.map((e) => (
                                    <tr key={e._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-mono text-xs font-bold">#{e.orderShortId}</td>
                                        <td className="px-6 py-4 text-xs font-semibold">{e.buyerName}</td>
                                        <td className="px-6 py-4 font-heading font-black text-sm">PKR {e.amount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusBadge(e.status)}`}>
                                                {e.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 flex flex-col sm:flex-row gap-3 items-end shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                <div className="flex-1 w-full">
                    <label className="font-body text-[9px] font-black uppercase text-slate-400 tracking-widest">Withdraw from wallet (prototype)</label>
                    <input
                        type="number"
                        min="1"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Amount in PKR"
                        className="w-full mt-1 px-4 py-2.5 border border-[#E7ECF3] rounded-xl text-sm font-semibold"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleWithdraw}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors"
                >
                    Withdraw
                </button>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-black text-[#0F172A] tracking-tight">Payments Overview</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 max-w-xl leading-relaxed">
                        Manage transactions, settlements, and payment records in real time.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => fetchTransactions(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm outline-none"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh Data
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-[#00A878] hover:bg-[#0DBB85] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_-4px_rgba(0,200,117,0.4)] hover:shadow-[0_8px_16px_-6px_rgba(0,200,117,0.5)] hover:-translate-y-0.5 outline-none"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Payments', value: formatPKR(totalAmount), icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%', trend: 'up' },
                    { label: 'Successful Payments', value: formatPKR(successfulAmount), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+8%', trend: 'up' },
                    { label: 'Pending Payments', value: formatPKR(pendingAmount), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: '-2%', trend: 'down' },
                    { label: 'Failed Transactions', value: formatPKR(failedAmount), icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', change: '-5%', trend: 'down' }
                ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="bg-white rounded-[1.5rem] p-6 border border-[#E2E8F0] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
                            <div className="pt-2">
                                <h3 className="text-[#64748B] font-bold text-[11px] uppercase tracking-wider mb-1.5">{kpi.label}</h3>
                                <p className="font-heading text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                
                {/* Transactions Section */}
                <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="font-heading text-lg font-bold text-slate-800">All Transactions</h2>
                        </div>
                        
                        {/* Filters */}
                        <div className="filter-bar-enterprise flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-enterprise py-2.5 pl-10 h-auto"
                                />
                            </div>
                            <div className="flex gap-2 flex-1 sm:flex-none">
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-slate-300 focus:border-[#00A878] focus:ring-2 focus:ring-[#00A878]/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Refunded">Refunded</option>
                                </select>
                                <select 
                                    value={methodFilter}
                                    onChange={(e) => setMethodFilter(e.target.value)}
                                    className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-slate-300 focus:border-[#00A878] focus:ring-2 focus:ring-[#00A878]/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    {paymentMethods.map(m => <option key={m} value={m}>{m === 'All' ? 'All Methods' : m}</option>)}
                                </select>
                                <select 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-slate-300 focus:border-[#00A878] focus:ring-2 focus:ring-[#00A878]/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    <option value="All Time">All Time</option>
                                    <option value="Last 7 Days">Last 7 Days</option>
                                    <option value="Last 30 Days">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-enterprise mt-0 border-x-0 border-b-0 rounded-t-none">
                        <div className="w-full overflow-x-auto scrollbar-enterprise">
                            <table className="min-w-[1000px]">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Buyer Name</th>
                                        <th className="text-right">Amount</th>
                                        <th>Payment Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTransactions.map((txn) => (
                                        <tr key={txn._id} className="cursor-pointer" onClick={() => txn.order?._id && router.push(`/manufacturer/orders/${txn.order._id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm font-bold text-slate-700">{txn._id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-slate-900 capitalize">{txn.wholesalerName || 'Unknown Buyer'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-slate-900 text-sm">{formatPKR(txn.receivedAmount || txn.totalAmount || 0)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 capitalize">
                                                <CreditCard size={12} /> {txn.paymentMethod || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(txn.status)} capitalize`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-500">{new Date(txn.timestamp).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{new Date(txn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-32 bg-slate-50/30">
                                            <div className="flex flex-col items-center justify-center min-w-[300px] max-w-[500px] mx-auto text-center">
                                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm mb-5">
                                                    <Inbox className="text-slate-300" size={28} />
                                                </div>
                                                <h3 className="text-xl font-heading font-black text-slate-800 tracking-tight mb-2 whitespace-nowrap">No payment records found</h3>
                                                <p className="text-slate-500 font-medium text-[13px] mb-8 leading-relaxed max-w-[400px]">
                                                    We couldn't find any transactions for the selected filters or date range.
                                                </p>
                                                <button 
                                                    onClick={() => { setSearchQuery(''); setStatusFilter('All'); setMethodFilter('All'); setDateFilter('All Time'); }}
                                                    className="px-6 py-2.5 bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                                                >
                                                    Reset Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <span className="text-sm text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-bold text-slate-700">{filteredTransactions.length}</span> entries
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full max-h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-lg font-bold text-slate-800">Recent Activity</h2>
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold transition-colors">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {recentActivity.length > 0 ? recentActivity.map((activity, idx) => {
                            const isRefund = activity.status.toLowerCase() === 'refunded';
                            const isPending = activity.status.toLowerCase().includes('pending');
                            return (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10 relative ${
                                            isRefund ? 'bg-slate-100 text-slate-500' : isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            <Activity size={18} />
                                        </div>
                                        {idx !== recentActivity.length - 1 && <div className="absolute top-10 bottom-[-24px] left-1/2 w-[2px] bg-slate-100 -translate-x-1/2 z-0"></div>}
                                    </div>
                                    <div className="pt-1 pb-2">
                                        <p className="text-sm font-bold text-slate-800 leading-snug">
                                            {isRefund ? 'Refund processed' : isPending ? 'Payment settlement pending' : `${formatPKR(activity.receivedAmount || activity.totalAmount || 0)} received`}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            {isRefund ? `Refund to ${activity.wholesalerName || 'Buyer'}` : isPending ? `From ${activity.wholesalerName || 'Buyer'}` : `From ${activity.wholesalerName || 'Buyer'}`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{new Date(activity.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <History size={40} className="text-slate-200 mb-3" />
                                <p className="text-sm font-medium text-slate-400">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="mt-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" size={22} />
                        Order issues from buyers
                    </h2>
                    <Link
                        href="/manufacturer/disputes"
                        className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline"
                    >
                        Full page →
                    </Link>
                </div>
                {sellerDisputes.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-white border border-slate-100 rounded-xl p-6">
                        No buyer issues on your orders right now.
                    </p>
                ) : (
                    sellerDisputes.map((d) => (
                        <DisputeResolutionCard
                            key={d._id}
                            dispute={d}
                            role="seller"
                            onRefresh={() => fetchTransactions(true)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ManufacturerTransactionsPage;
