"use client";

import { getApiBaseUrl } from '@/lib/api';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
    ArrowLeft, 
    Send, 
    Package, 
    Search,
    Inbox,
    Clock,
    Paperclip,
    Smile,
    ChevronRight,
    ExternalLink,
    Check,
    CheckCheck,
    MoreVertical,
    Handshake,
    Sparkles
} from 'lucide-react';

export default function WholesalerChatThreadPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const uid = user?.id || user?._id;

    const [threads, setThreads] = useState([]);
    const [thread, setThread] = useState(null);
    const [text, setText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [threadsLoading, setThreadsLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);

    const loadThreads = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/chats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setThreads(data.data || []);
            }
        } catch (e) {
            console.error('Failed to load thread list context');
        } finally {
            setThreadsLoading(false);
        }
    }, []);

    const loadActiveThread = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setThread(data.data);
                setError(null);
                
                fetch(`${getApiBaseUrl()}/api/chats/${id}/mark-read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    window.dispatchEvent(new CustomEvent('chats-read'));
                    loadThreads(); // Refresh thread unread states in list
                }).catch(err => console.error(err));
            } else {
                setError(data.error || 'Could not load active conversation');
                setThread(null);
            }
        } catch (e) {
            setError('Could not load active conversation');
        } finally {
            setLoading(false);
        }
    }, [id, loadThreads]);

    useEffect(() => {
        loadThreads();
        loadActiveThread();
    }, [id, loadThreads, loadActiveThread]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread?.messages?.length]);

    const send = async (e) => {
        if (e) e.preventDefault();
        const t = text.trim();
        if (!t || !id || sending) return;
        setSending(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${getApiBaseUrl()}/api/chats/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: t })
            });
            const data = await res.json();
            if (data.success) {
                setThread(data.data);
                setText('');
                loadThreads(); // Update last message in sidebar list
            } else {
                setError(data.error || 'Message not sent');
            }
        } catch (err) {
            setError('Message not sent');
        } finally {
            setSending(false);
        }
    };

    const getProductImage = (item) => {
        const productData = item?.product;
        const imgUrl = productData?.image || productData?.images?.[0];
        if (!imgUrl) return null;
        if (imgUrl.startsWith('http')) return imgUrl;
        return `${getApiBaseUrl()}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
    };

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

    if (loading && !thread) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-[#E5E7EB] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-4 font-sans text-[11px] font-[700] text-[#94A3B8] uppercase tracking-widest">Loading negotiation workspace...</p>
                </div>
            </div>
        );
    }

    const buyerId = String(thread?.buyerId?._id ?? thread?.buyerId);
    const isBuyer = uid && buyerId === String(uid);
    const peer = isBuyer ? thread?.sellerId : thread?.buyerId;
    const threadImg = getProductImage(thread);

    return (
        <div className="max-w-6xl mx-auto px-4 mt-6 pb-12 font-sans text-[#0F172A]">
            
            {/* Header section info */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-sans text-[30px] font-[800] text-[#0F172A] tracking-tight flex items-center gap-2">
                        Message Desk
                    </h1>
                    <p className="font-sans text-[14px] text-[#64748B] font-[500] mt-1">
                        Secure B2B trade desk for negotiating product terms and lead times.
                    </p>
                </div>
                {/* Mobile screen return CTA */}
                <button
                    onClick={() => router.push('/wholesaler/chats')}
                    className="md:hidden px-3.5 py-1.5 bg-[#F8FAFC] hover:bg-[#E5E7EB] text-[#475569] rounded-xl font-sans font-[700] text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                    <ArrowLeft size={12} /> All Chats
                </button>
            </div>

            {/* Split-pane Main Workspace */}
            <div className="bg-[#FFFFFF] rounded-[24px] border border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden flex h-[80vh] min-h-[600px] max-h-[850px]">
                
                {/* 1. LEFT SIDEBAR: THREAD LIST (Hidden on active mobile chat) */}
                <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-[#E5E7EB] flex flex-col shrink-0 ${
                    id ? 'hidden md:flex' : 'flex'
                }`}>
                    
                    {/* Sidebar search bar */}
                    <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
                            <input 
                                type="text"
                                placeholder="Search negotiations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] rounded-[16px] font-sans text-[13px] font-[600] text-[#0F172A] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,0.04)] focus:outline-none focus:bg-[#FFFFFF] focus:ring-4 focus:ring-[#00A878]/15 focus:border-[#00A878] transition-all placeholder:text-[#94A3B8]"
                            />
                        </div>
                    </div>

                    {/* Sidebar threads scrolling area */}
                    <div className="flex-1 overflow-y-auto divide-y divide-transparent p-2">
                        {filteredThreads.length === 0 ? (
                            <div className="text-center py-12 text-[#94A3B8]">
                                <Inbox className="mx-auto mb-3 text-slate-300" size={24} />
                                <span className="font-semibold text-xs">No active negotiations.</span>
                            </div>
                        ) : (
                            filteredThreads.map((t) => {
                                const bId = String(t.buyerId?._id ?? t.buyerId);
                                const isBuy = uid && bId === String(uid);
                                const p = isBuy ? t.sellerId : t.buyerId;
                                const last = t.messages?.length ? t.messages[t.messages.length - 1] : null;
                                const sideImg = getProductImage(t);
                                const isUnread = last && !last.isRead && String(last.senderId?._id || last.senderId) !== String(uid);
                                const isActive = String(t._id) === String(id);

                                return (
                                    <Link
                                        key={t._id}
                                        href={`/wholesaler/chats/${t._id}`}
                                        className={`flex items-start gap-3 p-4 rounded-[20px] transition-all duration-300 group mb-2 min-w-0 border ${
                                            isActive 
                                                ? 'bg-[#F8FAFC] border-[#00A878]/30 shadow-[0_4px_16px_rgba(0,168,120,0.08)] ring-1 ring-[#00A878]/20' 
                                                : isUnread 
                                                    ? 'bg-[#FFFFFF] border-[#E5E7EB] border-l-[4px] border-l-[#00A878] shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:border-[#CBD5E1]' 
                                                    : 'bg-[#FFFFFF] border-transparent hover:bg-[#F8FAFC] hover:border-[#E5E7EB]'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#071A35] to-[#1e3a5f] text-[#FFFFFF] font-sans font-[800] text-[15px] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(7,26,53,0.15)] relative mt-0.5">
                                            {p?.name?.slice(0, 2).toUpperCase() || 'TR'}
                                            {(isActive || isUnread) && <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#FFFFFF] shadow-[0_2px_4px_rgba(0,168,120,0.3)] ${isActive ? 'bg-[#00A878]' : 'bg-[#F59E0B]'}`}></span>}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="font-sans font-[700] text-[#0F172A] text-[13px] truncate group-hover:text-[#00A878] transition-colors">
                                                    {p?.name || 'Enterprise Trader'}
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

                                        {sideImg ? (
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E7EB] shrink-0 hidden sm:block shadow-xs mt-0.5">
                                                <img src={sideImg} alt={t.product?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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

                {/* 2. RIGHT CHAT MAIN CONSOLE */}
                <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]/50 relative">
                    
                    {/* Premium Header Context Card */}
                    <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] p-5 lg:px-8 lg:py-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-[0_4px_24px_rgba(15,23,42,0.04)] shrink-0 z-10 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            {/* Larger Premium Product Thumbnail */}
                            {threadImg ? (
                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[16px] overflow-hidden border border-[#E5E7EB] shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                                    <img src={threadImg} alt={thread?.product?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            ) : (
                                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                                    <Package className="text-[#94A3B8]" size={24} />
                                </div>
                            )}

                            <div className="min-w-0">
                                <div className="font-sans font-[800] text-[#0F172A] text-[16px] lg:text-[18px] tracking-tight truncate flex items-center gap-2">
                                    {thread?.product?.name || 'Wholesale Listing Negotiation'}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
                                    <span className="font-sans font-[700] text-[13px] text-[#475569] flex items-center gap-1">
                                        {peer?.name || 'Verified Partner'}
                                        <CheckCheck size={14} className="text-[#00A878]" />
                                    </span>
                                    <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-[#00A878] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,168,120,0.5)]"></span>
                                        <span className="font-sans font-[600] text-[12px] text-[#00A878]">Online</span>
                                    </span>
                                    <span className="w-1 h-1 bg-[#CBD5E1] rounded-full hidden sm:block"></span>
                                    <span className="font-sans font-[600] text-[11px] text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E5E7EB] hidden sm:block">
                                        B2B Negotiation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick View Product */}
                        {thread?.product?._id && (
                            <Link
                                href={`/wholesaler/marketplace/product/${thread.product._id}`}
                                className="px-5 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-[14px] font-sans font-[700] text-[12px] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                            >
                                View Listing <ExternalLink size={14} />
                            </Link>
                        )}
                    </div>

                    {/* Messages Scroll Layout */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0 flex flex-col">
                        {(thread?.messages || []).length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                                <div className="w-20 h-20 bg-[#FFFFFF] rounded-full border border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center justify-center mb-6">
                                    <Inbox className="text-[#00A878]" size={36} />
                                </div>
                                <h3 className="font-sans text-[22px] font-[800] text-[#0F172A] tracking-tight mb-3">
                                    No active conversations yet
                                </h3>
                                <p className="font-sans text-[14px] text-[#64748B] font-[500] max-w-md leading-relaxed">
                                    Send a message below to start this conversation with the supplier.
                                </p>
                            </div>
                        ) : (
                            (thread?.messages || []).map((m, idx) => {
                                const senderId = String(m.senderId?._id ?? m.senderId);
                                const isMine = uid && senderId === String(uid);

                                return (
                                    <div 
                                        key={m._id || idx} 
                                        className={`flex flex-col ${isMine ? 'items-end self-end' : 'items-start self-start'} max-w-[85%] sm:max-w-[75%] group`}
                                    >
                                        <div className={`px-5 py-3.5 text-[14px] font-[500] leading-relaxed transition-all ${
                                            isMine 
                                                ? 'bg-gradient-to-br from-[#071A35] to-[#1e3a5f] text-[#FFFFFF] rounded-[20px] rounded-tr-[4px] shadow-[0_8px_24px_rgba(7,26,53,0.12)] border border-[#FFFFFF]/10' 
                                                : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#0F172A] rounded-[20px] rounded-tl-[4px] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
                                        }`}>
                                            {/* Show sender tag only if not mine */}
                                            {!isMine && (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[#00A878] mb-1">
                                                    {m.senderId?.name || peer?.name || 'Partner'}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-line break-words">{m.text}</p>
                                        </div>

                                        {/* Timestamp metadata */}
                                        <div className="flex items-center gap-1.5 mt-2 px-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-[10px] font-[700] text-[#94A3B8] uppercase tracking-wider">
                                                {formatTime(m.createdAt || m.date)}
                                            </span>
                                            {isMine && (
                                                m.isRead ? (
                                                    <CheckCheck size={14} className="text-[#00A878]" />
                                                ) : (
                                                    <Check size={14} className="text-[#94A3B8]" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Premium Message Composer */}
                    <div className="p-4 lg:p-6 bg-[#FFFFFF]/80 backdrop-blur-xl border-t border-[#E5E7EB] shrink-0 z-10 sticky bottom-0">
                        <form 
                            onSubmit={send} 
                            className="flex items-end gap-3 max-w-5xl mx-auto w-full min-w-0 relative"
                        >
                            {/* Input container */}
                            <div className="flex-1 relative bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] flex items-center min-w-0 transition-all focus-within:ring-4 focus-within:ring-[#00A878]/10 focus-within:border-[#00A878] shadow-[0_4px_16px_rgba(15,23,42,0.04)] focus-within:shadow-[0_8px_24px_rgba(0,168,120,0.08)]">
                                <button 
                                    type="button"
                                    className="p-3.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-l-[24px] transition-colors shrink-0"
                                >
                                    <Paperclip size={20} />
                                </button>
                                
                                <input 
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 bg-transparent px-2 py-4 font-sans text-[15px] font-[500] text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8] min-w-0"
                                    maxLength={8000}
                                />

                                <button 
                                    type="button"
                                    className="p-3.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shrink-0 hidden sm:block"
                                >
                                    <Smile size={20} />
                                </button>
                            </div>

                            {/* Send CTA */}
                            <button 
                                type="submit"
                                disabled={sending || !text.trim()}
                                className="w-14 h-14 rounded-[20px] bg-[#00A878] text-[#FFFFFF] flex items-center justify-center hover:bg-[#009268] disabled:opacity-50 disabled:bg-[#E5E7EB] disabled:text-[#94A3B8] transition-all shrink-0 shadow-[0_4px_16px_rgba(0,168,120,0.25)] hover:shadow-[0_8px_24px_rgba(0,168,120,0.35)] hover:-translate-y-1 cursor-pointer"
                            >
                                {sending ? <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={20} className="ml-1" />}
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
}



