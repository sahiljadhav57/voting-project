import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ className = '' }) => {
    const { language, changeLanguage, availableLanguages } = useLanguage();

    return (
        <div className={`relative ${className}`}>
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-slate-400 transition-colors"
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <i className="fas fa-globe text-slate-400 text-xs"></i>
            </div>
        </div>
    );
};

export default LanguageSelector;
