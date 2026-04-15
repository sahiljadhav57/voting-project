import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    // Load user from localStorage on mount
    useEffect(() => {
        // AUTO-LOGIN DISABLED: User wants to start at login page every time
        /*
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const response = await authAPI.getCurrentUser();
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        loadUser();
        */
        setLoading(false);

        // Generate random wallet address and connect wallet
        const addr = '0x' + Array(40).fill(0).map(() => Math.random().toString(16)[2]).join('');
        setWalletAddress(addr);
        setWalletConnected(true);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setWalletConnected(false);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        walletConnected,
        setWalletConnected,
        walletAddress
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
