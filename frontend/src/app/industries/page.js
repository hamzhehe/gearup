"use client";

import React from 'react';
import Link from 'next/link';
import PublicLayout from '../../components/shared/PublicLayout';
import {
    Factory,
    TrendingUp,
    MapPin,
    Users,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    BarChart3,
} from 'lucide-react';

const Industries = () => {
    const industries = [
        {
            id: 'cricket',
            name: 'Cricket Manufacturing',
            badge: 'Heritage Ecosystem',
            description: 'Connect with Sialkot\'s premier cricket equipment ecosystem. Source from verified heritage manufacturers with ISO certification.',
            stats: {
                suppliers: { value: '450+', label: 'Active Mfrs' },
                avgOrder: { value: 'PKR 2.5M', label: 'Avg Ticket' },
                location: { value: 'Sialkot, PK', label: 'Primary Hub' }
            },
            products: ['Cricket Bats', 'Match Balls', 'Protective Gear', 'Team Kits', 'Training Aids']
        },
        {
            id: 'football',
            name: 'Football Manufacturing',
            badge: 'Global Export Hub',
            description: 'Access the world\'s leading football production hub. FIFA-quality manufacturing standards for global tournament supply.',
            stats: {
                suppliers: { value: '380+', label: 'Active Mfrs' },
                avgOrder: { value: 'PKR 1.8M', label: 'Avg Ticket' },
                location: { value: 'Sialkot, PK', label: 'Primary Hub' }
            },
            products: ['Match Balls', 'Team Jerseys', 'Pro Boots', 'Training Gear', 'Goalie Kits']
        }
    ];

    const trustFeatures = [
        {
            icon: ShieldCheck,
            title: "Verified Manufacturers",
            desc: "Strict vetting process ensuring legitimate factory ownership and certifications."
        },
        {
            icon: Factory,
            title: "Bulk-First Ecosystem",
            desc: "Optimized for high-volume production with clear MOQ tiers and capacity planning."
        },
        {
            icon: Users,
            title: "Direct B2B Access",
            desc: "Communicate directly with factory owners. No middle-men, transparent negotiation."
        },
        {
            icon: BarChart3,
            title: "Market Intelligence",
            desc: "Real-time pricing data and supply chain visibility for informed decision making."
        }
    ];

    return (
        <PublicLayout>
            <div className="min-h-screen bg-neutral-50 pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="text-center mb-20">
                        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Industries We Power
                        </h1>
                        <div className="h-1 w-24 bg-emerald-600 mx-auto mb-6 rounded-full"></div>
                        <p className="font-body text-xl text-gray-500 max-w-2xl mx-auto">
                            Specialized B2B marketplaces for Pakistan’s sports manufacturing ecosystem
                        </p>
                    </div>

                    {/* Industry Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-24">
                        {industries.map((industry) => (
                            <div key={industry.id} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                {/* Card Top Border Accent */}
                                <div className={`h-1.5 w-full ${industry.id === 'cricket' ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>

                                <div className="p-8 md:p-10">
                                    {/* Header Section */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 ${industry.id === 'cricket'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                                }`}>
                                                {industry.badge}
                                            </span>
                                            <h2 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-2">
                                                {industry.name}
                                                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="font-body text-gray-600 text-lg mb-8 leading-relaxed">
                                        {industry.description}
                                    </p>

                                    {/* KPI Grid */}
                                    <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-gray-100 bg-gray-50/50 rounded-xl px-4">
                                        <div className="text-center">
                                            <div className="flex justify-center mb-1 text-gray-400">
                                                <Factory className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading text-2xl font-bold text-gray-900">{industry.stats.suppliers.value}</div>
                                            <div className="font-body text-xs font-medium text-gray-500 uppercase tracking-wide">{industry.stats.suppliers.label}</div>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <div className="flex justify-center mb-1 text-gray-400">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading text-2xl font-bold text-gray-900">{industry.stats.avgOrder.value}</div>
                                            <div className="font-body text-xs font-medium text-gray-500 uppercase tracking-wide">{industry.stats.avgOrder.label}</div>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <div className="flex justify-center mb-1 text-gray-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading text-2xl font-bold text-gray-900">{industry.stats.location.value}</div>
                                            <div className="font-body text-xs font-medium text-gray-500 uppercase tracking-wide">{industry.stats.location.label}</div>
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="mb-10">
                                        <h3 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Key Products</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {industry.products.map((product, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-default">
                                                    {product}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/marketplace"
                                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors group-hover:shadow-lg"
                                        >
                                            Explore Marketplace
                                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                        <button className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-transparent text-gray-600 border border-transparent font-medium hover:bg-gray-50 rounded-lg transition-colors">
                                            View Verified Suppliers
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust & Stats Section */}
                    <div className="border-t border-gray-200 pt-16">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Why GearUp for Sports Manufacturing?</h2>
                            <p className="text-gray-500">Built for the specific needs of high-volume B2B commerce.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trustFeatures.map((feature, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center md:text-left">
                                    <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-lg mb-4">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="font-body text-sm text-gray-600 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
};

export default Industries;
