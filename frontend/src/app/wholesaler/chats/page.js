"use client";

import { getApiBaseUrl } from '@/lib/api';
import { resolveProductImageUrl } from '@/lib/marketplaceData';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

export default function WholesalerChatsPage() {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-[#E5E7EB] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-4 font-sans text-[11px] font-[700] text-[#94A3B8] uppercase tracking-widest">Loading Chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 mt-6 pb-12 font-sans text-[#0F172A]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-black text-[#0F172A] tracking-tight">Marketplace Chats</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 max-w-xl leading-relaxed">
                        Secure direct wholesale messaging and bulk deal settlement hub.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-150 bg-red-50 px-6 py-4 text-red-700 font-sans text-[12px] font-[700] shadow-[0_2px_8px_rgba(239,68,68,0.1)]">
                    {error}
                </div>
            )}

            {/* Split Pane Chat Container */}
            <div className="bg-[#FFFFFF] rounded-[24px] border border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden flex h-[80vh] min-h-[600px] max-h-[850px]">
                
                {/* 1. LEFT PANE: THREAD LIST */}
                <div className="w-full md:w-[340px] lg:w-[380px] border-r border-[#E5E7EB] flex flex-col shrink-0">
                    
                    {/* Thread Search Box */}
                    <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
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
                    <div className="flex-1 overflow-y-auto divide-y divide-transparent p-2">
                        {filteredThreads.length === 0 ? (
                            <div className="text-center py-12 text-[#94A3B8]">
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
                                        href={`/wholesaler/chats/${t._id}`}
                                        className={`flex items-start gap-3 p-4 rounded-[20px] transition-all duration-300 group mb-2 min-w-0 border ${
                                            isUnread 
                                                ? 'bg-[#FFFFFF] border-[#E5E7EB] border-l-[4px] border-l-[#00A878] shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:border-[#CBD5E1]' 
                                                : 'bg-[#FFFFFF] border-transparent hover:bg-[#F8FAFC] hover:border-[#E5E7EB]'
                                        }`}
                                    >
                                        {/* Peer initials badge */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#071A35] to-[#1e3a5f] text-[#FFFFFF] font-sans font-[800] text-[15px] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(7,26,53,0.15)] relative mt-0.5">
                                            {peer?.name?.slice(0, 2).toUpperCase() || 'TR'}
                                            {isUnread && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#F59E0B] rounded-full border-[2.5px] border-[#FFFFFF] shadow-[0_2px_4px_rgba(0,168,120,0.3)]"></span>}
                                        </div>

                                        {/* Thread Text details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="font-sans font-[700] text-[#0F172A] text-[13px] truncate group-hover:text-[#00A878] transition-colors">
                                                    {peer?.name || 'Enterprise Trader'}
                                                </span>
                                                {last && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] shrink-0 whitespace-nowrap mt-0.5">
                                                        {formatTime(last.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-sans font-[600] text-[#475569] text-[11px] truncate mb-1">
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
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E7EB] shrink-0 hidden sm:block shadow-xs mt-0.5">
                                                <img src={img} alt={t.product?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-center shrink-0 hidden sm:flex shadow-xs mt-0.5">
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
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]/50 z-0 relative">
                    <div className="empty-state-enterprise w-full max-w-lg border-none shadow-none bg-transparent">
                        <div className="icon-circle relative mx-auto">
                            <Inbox size={32} />
                        </div>
                        <h3>No active conversations yet</h3>
                        <p>Select a conversation from the list or start one from a product page in the marketplace.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}



