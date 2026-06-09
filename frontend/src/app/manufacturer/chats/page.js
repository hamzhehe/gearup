"use client";

import { getApiBaseUrl } from '@/lib/api';
import { resolveProductImageUrl } from '@/lib/marketplaceData';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from '@/components/common/Skeleton';
import { 
    MessageSquare, 
    Package, 
    ArrowRight, 
    Clock, 
    Search, 
    User,
    Check,
    CheckCheck,
    ChevronRight,
    Sparkles,
    Handshake,
    Inbox
} from 'lucide-react';

export default function ManufacturerChatsPage() {
    const { user } = useAuth();
    const uid = user?.id || user?._id;
    const [threads, setThreads] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/chats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setThreads(data.data || []);
                setError(null);
            } else {
                setError(data.error || 'Could not load conversations');
            }
        } catch (e) {
            setError('Could not load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const getProductImage = (t) => resolveProductImageUrl(t.product?.image || t.product?.images?.[0]);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const filteredThreads = threads.filter(t => {
        const buyerId = String(t.buyerId?._id ?? t.buyerId);
        const isBuyer = uid && buyerId === String(uid);
        const peer = isBuyer ? t.sellerId : t.buyerId;
        const peerName = (peer?.name || '').toLowerCase();
        const productName = (t.product?.name || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return peerName.includes(query) || productName.includes(query);
    });

    if (loading && threads.length === 0) {
        return (
            <div className="space-y-6 w-full animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="font-heading text-4xl font-black tracking-tighter text-slate-900 tracking-tight flex items-center gap-2">
                        <Handshake className="text-slate-900" size={28} /> Marketplace Chats
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                        Secure direct wholesale messaging and bulk deal settlement hub.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-[0_2px_15px_rgba(0,0,0,0.01)] overflow-hidden flex h-[620px] min-h-[500px]">
                    {/* Left Panel Threads Skeleton */}
                    <div className="w-full md:w-[340px] lg:w-[380px] border-r border-slate-100 flex flex-col shrink-0 p-4 space-y-3">
                        <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse w-full mb-2" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                                    <div className="h-2.5 w-full bg-slate-100 rounded animate-pulse" />
                                </div>
                                <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                            </div>
                        ))}
                    </div>

                    {/* Right Panel Detail Skeleton */}
                    <div className="hidden md:flex flex-1 flex-col bg-[#F8FAFC]/65 items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6 animate-pulse" />
                        <div className="h-4 w-48 bg-slate-100 rounded mx-auto animate-pulse mb-3" />
                        <div className="h-3 w-64 bg-slate-100 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            <div className="page-header-enterprise flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
                <div>
                    <h1 className="text-[30px] font-[800] text-[#0F172A] leading-tight tracking-tight flex items-center gap-3">
                        <Handshake className="text-[#00A878]" size={32} /> Marketplace Chats
                    </h1>
                    <p className="text-[16px] text-[#64748B] mt-2">
                        Secure direct wholesale messaging and bulk deal settlement hub.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-150 bg-red-50 px-6 py-4 text-red-700 font-body text-xs font-bold shadow-xs">
                    {error}
                </div>
            )}

            {/* Split Pane Chat Container */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden flex h-[620px] min-h-[500px]">
                
                {/* 1. LEFT PANE: THREAD LIST */}
                <div className="w-full md:w-[320px] lg:w-[380px] border-r border-slate-100 flex flex-col shrink-0 min-w-0">
                    
                    {/* Thread Search Box */}
                    <div className="p-4 border-b border-slate-50 bg-[#F8FAFC]">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text"
                                placeholder="Search negotiations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-enterprise py-2.5 h-auto text-[13px] pl-9"
                            />
                        </div>
                    </div>

                    {/* Thread List Scrollable Area */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 scrollbar-thin">
                        {filteredThreads.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Inbox className="mx-auto mb-3 text-slate-300" size={24} />
                                <span className="font-semibold text-xs">No active negotiations found.</span>
                            </div>
                        ) : (
                            filteredThreads.map((t) => {
                                const buyerId = String(t.buyerId?._id ?? t.buyerId);
                                const isBuyer = uid && buyerId === String(uid);
                                const peer = isBuyer ? t.sellerId : t.buyerId;
                                const last = t.messages?.length ? t.messages[t.messages.length - 1] : null;
                                const img = getProductImage(t);
                                const isUnread = last && !last.isRead && String(last.senderId?._id || last.senderId) !== String(uid);

                                return (
                                    <Link
                                        key={t._id}
                                        href={`/manufacturer/chats/${t._id}`}
                                        className={`flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 transition-all duration-300 group mb-1.5 min-w-0 border border-transparent ${
                                            isUnread 
                                                ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' 
                                                : 'hover:border-slate-200/60'
                                        }`}
                                    >
                                        {/* Peer initials badge */}
                                        <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-heading font-black text-sm flex items-center justify-center shrink-0 shadow-sm relative mt-0.5">
                                            {peer?.name?.slice(0, 2).toUpperCase() || 'TR'}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[2.5px] border-white shadow-xs"></span>
                                        </div>

                                        {/* Thread Text details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="font-heading font-bold text-slate-900 text-[13px] truncate group-hover:text-emerald-600 transition-colors">
                                                    {peer?.name || 'Enterprise Trader'}
                                                </span>
                                                {last && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                                                        {formatTime(last.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-body font-semibold text-slate-700 text-[11px] truncate mb-1">
                                                {t.product?.name || 'Product negotiation'}
                                            </div>
                                            {last && (
                                                <p className={`text-[11px] truncate ${isUnread ? 'font-black text-slate-900' : 'text-[#64748B] font-medium'}`}>
                                                    {last.text}
                                                </p>
                                            )}
                                        </div>

                                        {/* Product thumbnail */}
                                        {img ? (
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0 hidden sm:block shadow-xs mt-0.5">
                                                <img src={img} alt={t.product?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 hidden sm:flex shadow-xs mt-0.5">
                                                <Package className="text-slate-300" size={14} />
                                            </div>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. RIGHT PANE: CHAT EMPTY STATE */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]/50 z-0 relative min-w-0 w-full">
                    <div className="empty-state-enterprise w-full max-w-lg border-none shadow-none bg-transparent">
                        <div className="icon-circle relative mx-auto">
                            <MessageSquare size={32} />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <Sparkles className="text-white" size={12} />
                            </div>
                        </div>
                        <h3>Select a Conversation</h3>
                        <p>
                            Choose a conversation list card from the left panel to begin discussing trade prices, custom bulk orders, delivery timelines, and payment references directly.
                        </p>
                        <Link 
                            href="/manufacturer/orders"
                            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-body font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            View Sales Orders <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}



