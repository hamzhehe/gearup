"use client";

import React, { useState } from 'react';
import { getApiBaseUrl } from '@/lib/api';
import PublicLayout from '../../components/shared/PublicLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';
import SupportCard from '@/components/dashboard/SupportCard';
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Contact = () => {
    const { user } = useAuth();
    const isManufacturerDashboard = user?.role === 'manufacturer';
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: '',
        type: 'general'
    });
    const [status, setStatus] = useState({ type: null, message: '' }); // 'success' | 'error' | null
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setStatus({ type: 'error', message: 'Please fill in all required fields.' });
            setLoading(false);
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus({ type: 'error', message: 'Please enter a valid email address.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            let data = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok && data?.success) {
                setStatus({
                    type: 'success',
                    message: data.message || 'Thank you! Your message has been sent. We will respond soon.',
                });
                setFormData({ name: '', email: '', company: '', message: '', type: 'general' });
            } else {
                const errMsg = data?.error || 'We could not send your message. Please try again or email us directly.';
                setStatus({ type: 'error', message: errMsg });
            }
        } catch {
            setStatus({
                type: 'error',
                message: 'Network error. Check your connection or try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const contactInfoItems = [
        {
            icon: Mail,
            label: 'Email',
            value: 'contact@gearup.pk',
            href: 'mailto:contact@gearup.pk',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            icon: Phone,
            label: 'Phone',
            value: '+92 300 123 4567',
            href: 'tel:+923001234567',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            icon: MapPin,
            label: 'Offices',
            value: 'Lahore & Sialkot, Pakistan',
            href: null,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
    ];

    const formSection = (
                    <div className="grid lg:grid-cols-2 gap-10 items-start">
                        {/* Left — Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-[28px] font-[800] text-[#0F172A] leading-tight tracking-tight mb-2">Contact Information</h2>
                                <p className="text-[15px] text-[#64748B] font-medium leading-relaxed">
                                    Whether you're a manufacturer expanding reach, a retailer seeking suppliers, or exploring partnerships — our enterprise support team is here to help.
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-3">
                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-md shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    24/7 B2B Support
                                </span>
                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    Avg reply: &lt;2 hours
                                </span>
                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-md shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    Dedicated Enterprise
                                </span>
                            </div>

                            {/* Contact Items */}
                            <div className="space-y-4">
                                {contactInfoItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="group flex items-center gap-4 p-5 bg-white border border-[#E5E7EB] rounded-[16px] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 cursor-pointer">
                                            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-sm transition-all duration-300`}>
                                                <Icon className={item.color} size={22} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-1">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className={`font-bold text-[15px] ${item.color} hover:opacity-80 transition-opacity`}>
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="font-bold text-[15px] text-[#0F172A]">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* SLA Info */}
                            <div className="bg-slate-900 rounded-[16px] p-6 text-white shadow-xl relative overflow-hidden border border-slate-800 mt-2">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00A878]/10 blur-[50px] rounded-full pointer-events-none" />
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#00A878] mb-5 relative z-10">Support Hours</h4>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] font-medium text-slate-400">Business Inquiries</span>
                                        <span className="text-[13px] font-bold text-white">Mon–Sat, 9am–7pm</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] font-medium text-slate-400">Emergency Support</span>
                                        <span className="text-[13px] font-bold text-[#00A878]">24 / 7</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] font-medium text-slate-400">Response SLA</span>
                                        <span className="text-[13px] font-bold text-white">Under 2 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right — Contact Form */}
                        <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-8">
                            {status.type === 'success' && (
                                <div className="mb-8 p-4 bg-[#00A878]/10 border border-[#00A878]/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                                    <CheckCircle className="w-5 h-5 text-[#00A878] flex-shrink-0 mt-0.5" />
                                    <p className="text-[14px] text-[#00A878] font-bold">{status.message}</p>
                                </div>
                            )}
                            {status.type === 'error' && (
                                <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-[14px] text-rose-600 font-bold">{status.message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div>
                                    <label htmlFor="type" className="block text-[12px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                                        Inquiry Type
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-slate-300 focus:ring-4 focus:ring-[#00A878]/10 focus:border-[#00A878] text-[#0F172A] font-semibold text-[14px] outline-none transition-all duration-200 appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="sales">Sales &amp; Partnership</option>
                                        <option value="support">Support</option>
                                        <option value="demo">Request Demo</option>
                                    </select>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-[12px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                                            Full Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-slate-300 focus:ring-4 focus:ring-[#00A878]/10 focus:border-[#00A878] text-[#0F172A] font-semibold text-[14px] outline-none transition-all duration-200 placeholder:text-slate-400 shadow-sm"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="company" className="block text-[12px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-slate-300 focus:ring-4 focus:ring-[#00A878]/10 focus:border-[#00A878] text-[#0F172A] font-semibold text-[14px] outline-none transition-all duration-200 placeholder:text-slate-400 shadow-sm"
                                            placeholder="Acme Sports"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-[12px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-slate-300 focus:ring-4 focus:ring-[#00A878]/10 focus:border-[#00A878] text-[#0F172A] font-semibold text-[14px] outline-none transition-all duration-200 placeholder:text-slate-400 shadow-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-[12px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                                        Message <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="5"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-slate-300 focus:ring-4 focus:ring-[#00A878]/10 focus:border-[#00A878] text-[#0F172A] font-semibold text-[14px] outline-none transition-all duration-200 resize-none placeholder:text-slate-400 shadow-sm"
                                        placeholder="Describe your inquiry, partnership interest, or support need in detail..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#00A878] hover:bg-[#009166] text-white rounded-xl font-bold text-[14px] transition-all duration-300 shadow-[0_8px_24px_rgba(0,168,120,0.25)] hover:shadow-[0_12px_28px_rgba(0,168,120,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
    );

    if (isManufacturerDashboard) {
        return (
            <ProtectedRoute allowedRoles={['manufacturer', 'wholesaler', 'admin']}>
                <DashboardLayout>
                    <PageShell>
                        <PageHeader
                            title="Help & Support"
                            subtitle="Contact our B2B merchant support team or send an inquiry"
                        />
                        <div className="grid lg:grid-cols-3 gap-6 items-start">
                            <div className="lg:col-span-2">{formSection}</div>
                            <SupportCard />
                        </div>
                    </PageShell>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="font-body text-xl text-slate-600 max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Tell us how GearUp can transform your business.
                        </p>
                    </div>
                    {formSection}
                </div>
            </div>
        </PublicLayout>
    );
};

export default Contact;
