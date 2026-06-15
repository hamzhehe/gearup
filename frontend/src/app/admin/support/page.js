'use client';

import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/lib/api';
import AdminPageShell from '@/components/admin/AdminPageShell';
import { Mail, MessageSquare, AlertCircle, Calendar, Building, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${getApiBaseUrl()}/api/admin/contact-messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        } else {
          toast.error(data.error || 'Failed to load messages');
        }
      } catch (err) {
        toast.error('Network error while loading messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]" />
            <div className="h-64 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]" />
        </div>
      </div>
    );
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'sales': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'support': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'advertising': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'verification': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'general': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'other': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatType = (type) => {
    if (!type) return 'General';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleSendReply = async (id) => {
    if (!replyText.trim()) {
        return toast.error("Reply message cannot be empty");
    }
    setIsSending(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${getApiBaseUrl()}/api/admin/contact-messages/${id}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ replyMessage: replyText })
        });
        const data = await res.json();
        
        if (data.success) {
            toast.success("Reply sent successfully via email");
            setMessages(messages.map(msg => msg._id === id ? { ...msg, isReplied: true } : msg));
            setReplyingTo(null);
            setReplyText('');
        } else {
            toast.error(data.error || "Failed to send reply");
        }
    } catch (err) {
        toast.error("Network error while sending reply");
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="w-full">
      <AdminPageShell
        title="Support Center"
        description="Manage and respond to all incoming enterprise inquiries and support requests."
        align="left"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[24px] border border-[#E5E7EB] text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-[#94A3B8]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">Inbox Zero</h3>
            <p className="text-[15px] text-[#64748B] max-w-md">You're all caught up! When users submit a request through the contact page, it will appear right here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {messages.map((msg) => (
              <div key={msg._id} className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)] hover:border-slate-300 group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-[#00A878] group-hover:to-emerald-400 transition-all duration-500" />
                
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-[18px] font-bold text-[#0F172A] truncate">
                            {msg.name}
                        </h3>
                        {msg.company && (
                            <span className="text-[12px] font-bold text-[#64748B] px-2.5 py-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                                <Building size={12} className="text-[#94A3B8]" />
                                {msg.company}
                            </span>
                        )}
                    </div>
                    <a href={`mailto:${msg.email}`} className="text-[14px] font-medium text-[#64748B] hover:text-[#00A878] transition-colors flex items-center gap-2 w-fit">
                        <Mail size={14} />
                        {msg.email}
                    </a>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${getTypeStyle(msg.type)}`}>
                      {formatType(msg.type)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#94A3B8] flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(msg.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                    <div className="flex-1 bg-[#F8FAFC] rounded-[16px] p-5 border border-transparent group-hover:border-[#E5E7EB] transition-colors mb-4">
                      <p className="text-[15px] leading-relaxed text-[#334155] whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {replyingTo === msg._id ? (
                        <div className="mt-auto animate-in fade-in slide-in-from-top-2 duration-300">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your response here. This will be emailed directly to the user..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#00A878] focus:ring-4 focus:ring-[#00A878]/10 rounded-xl text-[14px] outline-none transition-all resize-none shadow-sm mb-3"
                            />
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                    className="px-4 py-2 text-[13px] font-bold text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSendReply(msg._id)}
                                    disabled={isSending}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00A878] text-white text-[13px] font-bold rounded-lg hover:bg-[#009166] transition-colors shadow-sm disabled:opacity-70"
                                >
                                    {isSending ? 'Sending...' : 'Send Email Reply'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex justify-end">
                            {msg.isReplied ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[13px] font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Replied
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(msg._id)}
                                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-[#0F172A] border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] hover:border-slate-300 transition-all shadow-sm group-hover:border-[#00A878]/30 group-hover:text-[#00A878]"
                                >
                                    <MessageSquare size={14} />
                                    Reply to Message
                                </button>
                            )}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPageShell>
    </div>
  );
}
