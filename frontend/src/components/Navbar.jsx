import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { user, logout, walletConnected, setWalletConnected, walletAddress } = useAuth();
    const { t } = useLanguage();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <i className="fas fa-link text-blue-600 text-xl mr-2"></i>
                        <span className="text-xl font-bold text-slate-800">{t('loginTitle')}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <LanguageSelector />

                        {/* Wallet Connection - Only for non-admin users */}
                        {user.role !== 'admin' && (
                            <>
                                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                                    <div className={`w-2 h-2 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                    <span className="text-xs font-mono text-slate-600">
                                        {walletConnected ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : t('notConnected')}
                                    </span>
                                </div>

                                {!walletConnected && (
                                    <button
                                        onClick={() => setWalletConnected(true)}
                                        className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center"
                                    >
                                        <i className="fas fa-wallet mr-2"></i> {t('connectWallet')}
                                    </button>
                                )}
                            </>
                        )}

                        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-semibold text-slate-800">{user.username}</div>
                                <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                {user.username[0].toUpperCase()}
                            </div>
                            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                                <i className="fas fa-sign-out-alt text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
