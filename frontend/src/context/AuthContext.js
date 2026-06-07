"use client";

import { getApiBaseUrl } from '@/lib/api';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { flushSync } from 'react-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('gearup_user');
            const token = localStorage.getItem('token');

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    localStorage.removeItem('gearup_user');
                }
            }

            // Show UI immediately with cached session; refresh profile in background.
            setLoading(false);

            if (token) {
                try {
                    const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                        setUser(data.data);
                        localStorage.setItem('gearup_user', JSON.stringify(data.data));
                    }
                } catch (error) {
                    console.error('Session restoration error:', error);
                }
            }
        };

        initAuth();
    }, []);

    const login = (userData, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('gearup_user', JSON.stringify(userData));
            if (token) {
                localStorage.setItem('token', token);
            }
        }
        // Ensure context is committed before client navigates (e.g. admin-login → /admin/dashboard).
        flushSync(() => {
            setUser(userData);
        });
    };

    const logout = async () => {
        try {
            await fetch(`${getApiBaseUrl()}/api/auth/logout`);
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUser(null);
        localStorage.removeItem('gearup_user');
        localStorage.removeItem('token');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('gearup_user', JSON.stringify(userData));
    };

    const updateVerificationStatus = (status, additionalData = {}) => {
        const updatedUser = {
            ...user,
            verificationStatus: status,
            verified: status === 'approved' || status === 'verified',
            ...additionalData
        };
        updateUser(updatedUser);
    };

    const value = {
        user,
        login,
        logout,
        updateUser,
        updateVerificationStatus,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
