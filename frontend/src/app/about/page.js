"use client";

import React from 'react';
import PublicLayout from '../../components/shared/PublicLayout';

const About = () => {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">About GearUp</h1>
                        <p className="font-body text-xl text-slate-600 max-w-2xl mx-auto">
                            Transforming Pakistan's sports goods industry through digital innovation
                        </p>
                    </div>

                    <div className="space-y-16">
                        <section>
                            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                            <p className="font-body text-lg text-slate-600 leading-relaxed mb-6">
                                GearUp is Pakistan's premier B2B digital marketplace dedicated to revolutionizing the sports goods industry.
                                We connect manufacturers, wholesalers, retailers, and distributors in a single, streamlined platform that
                                facilitates efficient trade, fosters growth, and drives innovation.
                            </p>
                            <p className="font-body text-lg text-slate-600 leading-relaxed">
                                Our mission is to digitize traditional trade processes, making it easier for businesses to discover trusted
                                suppliers, manage bulk orders, track shipments, and make data-driven decisions that propel their success.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-6">Who We Serve</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 group hover:border-emerald-500 transition-all">
                                    <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Manufacturers</h3>
                                    <p className="font-body text-slate-600 leading-relaxed">
                                        Showcase your products, manage inventory, and connect with buyers across Pakistan and beyond.
                                    </p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 group hover:border-emerald-500 transition-all">
                                    <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Wholesalers</h3>
                                    <p className="font-body text-slate-600 leading-relaxed">
                                        Discover verified suppliers, place bulk orders, and streamline your procurement process.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-8">Why GearUp</h2>
                            <ul className="space-y-6">
                                {[
                                    { title: "Verified Suppliers", desc: "All manufacturers undergo strict verification processes" },
                                    { title: "Secure Transactions", desc: "Bank-grade encryption for all payments and data" },
                                    { title: "AI-Powered Insights", desc: "Make data-driven decisions with advanced analytics" },
                                    { title: "Local Industry Focus", desc: "Deep expertise in Pakistan sports manufacturing" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start group">
                                        <div className="mr-5 mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="font-heading font-bold text-lg text-slate-900 mb-1">{item.title}</h4>
                                            <p className="font-body text-slate-600">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="pt-12 border-t border-slate-200">
                            <div className="text-center mb-12">
                                <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Leadership</h2>
                                <p className="font-body text-lg text-slate-600 max-w-2xl mx-auto">
                                    The people building GearUp’s B2B sports commerce ecosystem
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { name: "Mustafeez ur Rehman", role: "Co-Founder / Platform Strategy" },
                                    { name: "Hamza Asif", role: "Co-Founder / Product & Technology" },
                                    { name: "Fazail Ishtiaq", role: "Co-Founder / Operations & Growth" }
                                ].map((member, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-500">
                                        <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=022c22&color=fff&size=500`}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="p-8 text-center bg-white relative z-10">
                                            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                                            <p className="font-body text-sm font-semibold text-emerald-600 uppercase tracking-widest">
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default About;
