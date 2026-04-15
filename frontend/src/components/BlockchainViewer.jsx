import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const BlockchainViewer = ({ chain }) => {
    const [show, setShow] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-xl border border-slate-700 mb-8 overflow-hidden">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShow(!show)}>
                <h3 className="text-lg font-bold text-white flex items-center">
                    <i className="fas fa-cubes mr-2 text-emerald-400"></i> {t('liveBlockchain')}
                </h3>
                <i className={`fas fa-chevron-${show ? 'up' : 'down'} transition-transform`}></i>
            </div>

            {show && (
                <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                    {chain.map((block, idx) => (
                        <div key={idx} className="min-w-[280px] bg-slate-800 p-4 rounded-lg border border-slate-600 flex-shrink-0 hover:border-blue-500 transition-colors relative group">
                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md">
                                Block #{block.index}
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                                <div>
                                    <span className="text-slate-500">{t('hash')}:</span>
                                    <div className="text-emerald-400 truncate">{block.hash}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500">{t('prevHash')}:</span>
                                    <div className="text-slate-400 truncate">{block.prevHash}</div>
                                </div>
                                <div className="pt-2 border-t border-slate-700 mt-2">
                                    <span className="text-slate-500 block mb-1">{t('data')}:</span>
                                    <div className="bg-slate-900 p-2 rounded text-blue-300">
                                        {block.data.type}
                                        {block.data.voter && <div className="text-slate-500 mt-1">{t('voter')}: {block.data.voterHash}</div>}
                                    </div>
                                </div>
                                <div className="text-right text-slate-600 mt-2">
                                    {new Date(block.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            {idx < chain.length - 1 && (
                                <div className="absolute top-1/2 -right-6 w-4 h-0.5 bg-slate-600"></div>
                            )}
                        </div>
                    ))}
                    {chain.length === 0 && <p className="text-slate-500">{t('genesisBlock')}</p>}
                </div>
            )}
        </div>
    );
};

export default BlockchainViewer;
