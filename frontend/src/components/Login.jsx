import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';

const REGION_DATA = {
    "Maharashtra": {
        "Mumbai": ["Mumbai South", "Mumbai North"],
        "Pune": ["Pune City", "Baramati"]
    },
    "Delhi": {
        "New Delhi": ["New Delhi", "Chandni Chowk"],
        "South Delhi": ["South Delhi", "Mehrauli"]
    },
    "Karnataka": {
        "Bangalore": ["Bangalore South", "Bangalore North"],
        "Mysore": ["Mysore", "Chamundeshwari"]
    }
};

const Login = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [isAdminLogin, setIsAdminLogin] = useState(false);

    // User State (Aadhaar)
    const [aadhaar, setAadhaar] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [regionStep, setRegionStep] = useState(false);

    // Region State
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedConstituency, setSelectedConstituency] = useState('');

    // Admin State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUserLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!otpSent) {
                // Request OTP
                if (aadhaar.length !== 12) {
                    setError('Please enter a valid 12-digit Aadhaar number.');
                    setLoading(false);
                    return;
                }

                const response = await authAPI.requestOTP(aadhaar);
                setOtpSent(true);

                // Show OTP in development
                if (response.data.otp) {
                    alert(`OTP Sent: ${response.data.otp}`);
                }
            } else if (!regionStep) {
                // Verify OTP (move to region step without API call)
                if (otp.length === 6) {
                    setRegionStep(true);
                } else {
                    setError('Please enter a valid 6-digit OTP');
                }
            } else {
                // Final Login with Region Data
                if (!selectedState || !selectedDistrict || !selectedConstituency) {
                    setError('Please select all region details.');
                    setLoading(false);
                    return;
                }

                const response = await authAPI.verifyOTP(aadhaar, otp, {
                    state: selectedState,
                    district: selectedDistrict,
                    constituency: selectedConstituency
                });

                login(response.data.token, response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.adminLogin(username, password);
            login(response.data.token, response.data.user);
        } catch (err) {
            setError(err.response?.data?.message || t('invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsAdminLogin(!isAdminLogin);
        setError('');
        setOtpSent(false);
        setRegionStep(false);
        setAadhaar('');
        setOtp('');
        setUsername('');
        setPassword('');
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedConstituency('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            {/* Language Selector - Top Left */}
            <div className="absolute top-4 left-4 z-10">
                <LanguageSelector />
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
                {/* Admin Toggle */}
                <button
                    onClick={resetForm}
                    className="absolute top-8 right-8 text-xs text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                    {isAdminLogin ? t('userLogin') : t('loginAsAdmin')}
                </button>

                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <img
                        src="/votox-logo.jpg"
                        alt="VOTOX Logo"
                        className="w-32 h-32 mx-auto mb-4 rounded-xl shadow-lg object-cover"
                    />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {t('loginTitle')}
                    </h1>
                    <p className="text-slate-600 text-sm">{t('loginSubtitle')}</p>
                </div>

                {isAdminLogin ? (
                    /* ADMIN LOGIN FORM */
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <h3 className="text-center text-lg font-semibold text-blue-600">{t('adminAccess')}</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('username')}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
                                placeholder="admin"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
                                placeholder="password"
                                required
                            />
                        </div>
                        {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? t('loading') : t('loginAsAdmin')}
                        </button>
                    </form>
                ) : (
                    /* USER LOGIN FORM (AADHAAR -> OTP -> REGION) */
                    <form onSubmit={handleUserLogin} className="space-y-4">
                        <h3 className="text-center text-lg font-semibold text-emerald-600">{t('voterAuth')}</h3>

                        {!regionStep ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('aadhaarNumber')}</label>
                                    <input
                                        type="text"
                                        value={aadhaar}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            setAadhaar(val);
                                        }}
                                        disabled={otpSent}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all tracking-widest text-slate-900"
                                        placeholder="1234 5678 9012"
                                        required
                                    />
                                </div>

                                {otpSent && (
                                    <div className="fade-in">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('enterOTP')}</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all tracking-widest text-center text-xl text-slate-900"
                                            placeholder="• • • • • •"
                                            required
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            /* REGION SELECTION STEP */
                            <div className="space-y-3 fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('state')}</label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedDistrict('');
                                            setSelectedConstituency('');
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700"
                                        required
                                    >
                                        <option value="">{t('selectState')}</option>
                                        {Object.keys(REGION_DATA).map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedState && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('district')}</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => {
                                                setSelectedDistrict(e.target.value);
                                                setSelectedConstituency('');
                                            }}
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700"
                                            required
                                        >
                                            <option value="">{t('selectDistrict')}</option>
                                            {Object.keys(REGION_DATA[selectedState]).map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedDistrict && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('constituency')}</label>
                                        <select
                                            value={selectedConstituency}
                                            onChange={(e) => setSelectedConstituency(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700"
                                            required
                                        >
                                            <option value="">{t('selectConstituency')}</option>
                                            {REGION_DATA[selectedState][selectedDistrict].map(constituency => (
                                                <option key={constituency} value={constituency}>{constituency}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? t('loading') : (!otpSent ? t('requestOTP') : (!regionStep ? t('verifyProceed') : t('completeRegistration')))}
                        </button>
                    </form>
                )}

                <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-center text-slate-500">
                    <p>{t('defaultAdmin')}</p>
                    <p className="mt-1">{t('mockOTP')}</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
