"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Lock } from 'lucide-react';
import AdminButton from './AdminButton';

const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-md' : 'bg-white/95 backdrop-blur-sm'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex flex-col">
                        <span className="font-heading text-2xl font-bold text-primary-deep">GearUp</span>
                        <span className="font-body text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Empowering The Future of Sports Commerce</span>
                    </Link>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex desktop-auth-menu items-center space-x-8">
                        <Link href={isAuthenticated ? (user?.role === 'wholesaler' || user?.role === 'manufacturer' ? '/wholesaler/marketplace' : `/${user?.role}/dashboard`) : '/login'} className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors">Marketplace</Link>
                        <Link href="/industries" className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors">Industries</Link>
                        <Link href="/about" className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors">About</Link>
                        <Link href="/contact" className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors">Contact</Link>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4 border-l border-neutral-200 pl-4">
                                {user?.role === 'admin' ? (
                                    <>
                                        <span className="font-body text-sm font-semibold text-primary-deep mr-2">
                                            {user.name}
                                        </span>
                                        <AdminButton to="/admin/dashboard" />
                                    </>
                                ) : (
                                    <Link href={user?.role === 'manufacturer' ? '/manufacturer/dashboard' : '/wholesaler/dashboard'} className="font-body text-sm font-medium text-primary-deep hover:text-primary-navy transition-colors">
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-primary-deep text-white rounded hover:bg-primary-navy transition-colors font-body text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 border-l border-neutral-200 pl-4">
                                <Link href="/login" className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors">
                                    Log In
                                </Link>
                                <Link href="/register" className="px-4 py-2 bg-primary-deep text-white rounded hover:bg-primary-navy transition-colors font-body text-sm font-medium">
                                    Sign Up
                                </Link>

                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="mobile-auth-menu absolute top-20 left-0 w-full bg-white shadow-lg flex flex-col p-4 border-t border-slate-100">
                            <Link href={isAuthenticated ? (user?.role === 'wholesaler' || user?.role === 'manufacturer' ? '/wholesaler/marketplace' : `/${user?.role}/dashboard`) : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors py-3 border-b border-slate-50">Marketplace</Link>
                            <Link href="/industries" onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors py-3 border-b border-slate-50">Industries</Link>
                            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors py-3 border-b border-slate-50">About</Link>
                            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors py-3 border-b border-slate-50">Contact</Link>

                            {isAuthenticated ? (
                                <div className="flex flex-col space-y-3 mt-4">
                                    {user?.role === 'admin' ? (
                                        <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-primary-deep hover:text-primary-navy transition-colors py-2">
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link href={user?.role === 'manufacturer' ? '/manufacturer/dashboard' : '/wholesaler/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="font-body text-sm font-medium text-primary-deep hover:text-primary-navy transition-colors py-2">
                                            Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-center px-4 py-3 bg-primary-deep text-white rounded hover:bg-primary-navy transition-colors font-body text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-3 mt-4">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-body text-sm font-medium text-neutral-800 hover:text-primary-navy transition-colors py-2 border border-slate-200 rounded">
                                        Log In
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center px-4 py-3 bg-primary-deep text-white rounded hover:bg-primary-navy transition-colors font-body text-sm font-medium">
                                        Sign Up
                                    </Link>

                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
