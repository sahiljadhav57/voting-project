import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { votesAPI } from '../services/api';

const ElectionCard = ({ election, onVote, onUpdateStatus, onDelete, onArchive, isArchived = false }) => {
    const { user, walletConnected, walletAddress } = useAuth();
    const { t } = useLanguage();
    const [votingFor, setVotingFor] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [showBio, setShowBio] = useState(null);

    const hasVoted = user.hasVoted && user.hasVoted[election._id];
    const isEnded = election.status === "Ended";
    const isStarted = election.status === "Active" || election.status === "Pending";

    // Calculate total votes
    const totalVotes = election.candidates.reduce((acc, curr) => acc + curr.votes, 0);

    // Determine Winner
    const getWinner = () => {
        if (election.candidates.length === 0) return null;
        return election.candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
    };
    const winner = getWinner();

    const handleVote = async (candidateId) => {
        if (!walletConnected) {
            alert(t('pleaseConnectWallet'));
            return;
        }

        setVotingFor(candidateId);
        setProcessing(true);

        try {
            await votesAPI.castVote(election._id, candidateId, walletAddress);

            // Update local state
            onVote(election._id, candidateId);

            // Simulate network delay
            setTimeout(() => {
                setProcessing(false);
                setVotingFor(null);
            }, 1000);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cast vote');
            setProcessing(false);
            setVotingFor(null);
        }
    };

    const getStatusColor = () => {
        if (election.status === "Ended") return "bg-red-100 text-red-700";
        if (election.status === "Active") return "bg-green-100 text-green-700";
        return "bg-yellow-100 text-yellow-700";
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full fade-in">
            <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
                        {t(election.status.toLowerCase())}
                    </span>
                    {user.role === 'admin' && (
                        <div className="flex space-x-1">
                            {!isArchived && election.status !== 'Active' && election.status !== 'Ended' && (
                                <button onClick={() => onUpdateStatus(election._id, 'Active')} className="p-1 text-green-600 hover:bg-green-50 rounded" title={t('start')}>
                                    <i className="fas fa-play"></i>
                                </button>
                            )}
                            {!isArchived && election.status === 'Active' && (
                                <button onClick={() => onUpdateStatus(election._id, 'Ended')} className="p-1 text-red-600 hover:bg-red-50 rounded" title={t('end')}>
                                    <i className="fas fa-stop"></i>
                                </button>
                            )}
                            {!isArchived && election.status === 'Ended' && onArchive && (
                                <button onClick={() => onArchive(election._id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title={t('archiveElection')}>
                                    <i className="fas fa-archive"></i>
                                </button>
                            )}
                            {election.status === 'Ended' && onDelete && (
                                <button onClick={() => onDelete(election._id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title={t('deleteElection')}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{election.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{election.description}</p>
                <div className="mt-3 flex items-center text-xs text-slate-400 space-x-4">
                    <span><i className="far fa-calendar-alt mr-1"></i> {t('start')}: {new Date(election.startDate).toLocaleDateString()}</span>
                    <span><i className="far fa-flag mr-1"></i> {t('end')}: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>

                {/* WINNER DECLARATION - ONLY SHOWN WHEN ENDED */}
                {isEnded && winner && winner.votes > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-lg flex items-center justify-between animate-pulse shadow-sm">
                        <div>
                            <h4 className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider flex items-center">
                                <i className="fas fa-trophy mr-1 text-yellow-600"></i> {t('electionWinner')}
                            </h4>
                            <div className="flex items-center mt-1">
                                <span className="text-2xl mr-2">{winner.avatar}</span>
                                <span className="font-bold text-slate-800 text-lg">{winner.name}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-700">{winner.votes}</div>
                            <div className="text-[10px] text-yellow-600 uppercase">{t('votes')}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 flex-grow flex flex-col space-y-4">
                {election.candidates.map(cand => {
                    const percent = totalVotes === 0 ? 0 : Math.round((cand.votes / totalVotes) * 100);
                    return (
                        <div key={cand.id} className="relative">
                            <div className="flex items-center justify-between mb-1 z-10 relative">
                                <div className="flex items-center flex-1 space-x-3">
                                    {/* Candidate Photo */}
                                    {cand.photo ? (
                                        <img
                                            src={`http://localhost:5000${cand.photo}`}
                                            alt={cand.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                                        />
                                    ) : (
                                        <span className="text-2xl">{cand.avatar}</span>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="font-semibold text-slate-700">{cand.name}</div>
                                            {/* Party Symbol */}
                                            {cand.partySymbol && (
                                                <img
                                                    src={`http://localhost:5000${cand.partySymbol}`}
                                                    alt="Party Symbol"
                                                    className="w-6 h-6 object-contain"
                                                    title={cand.party}
                                                />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">{cand.party}</div>

                                        {/* Bio and Manifesto Links */}
                                        <div className="flex items-center space-x-3 mt-1">
                                            {cand.bio && (
                                                <button
                                                    onClick={() => setShowBio(showBio === cand.id ? null : cand.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                    {showBio === cand.id ? t('close') : t('candidateBio')}
                                                </button>
                                            )}
                                            {cand.manifesto && (
                                                <a
                                                    href={`http://localhost:5000${cand.manifesto}`}
                                                    download
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                    title="Download Manifesto"
                                                >
                                                    <i className="fas fa-file-pdf mr-1"></i>
                                                    {t('manifesto')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* SHOW VOTES ONLY IF ENDED (FOR EVERYONE) */}
                                    {isEnded ? (
                                        <div className="font-bold text-slate-800">{cand.votes} <span className="text-xs font-normal text-slate-500">{t('votes')}</span></div>
                                    ) : (
                                        /* HIDE VOTE BUTTON FOR ADMINS */
                                        user.role === 'admin' ? (
                                            <span className="text-xs text-slate-400 italic">{t('adminView')}</span>
                                        ) : (
                                            processing && votingFor === cand.id ? (
                                                <i className="fas fa-circle-notch animate-spin text-blue-600"></i>
                                            ) : (
                                                <button
                                                    onClick={() => handleVote(cand.id)}
                                                    disabled={!isStarted || processing || hasVoted}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {hasVoted ? t('voted') : t('vote')}
                                                </button>
                                            )
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Bio Display */}
                            {showBio === cand.id && cand.bio && (
                                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200 fade-in">
                                    {cand.bio}
                                </div>
                            )}

                            {/* SHOW PROGRESS BAR ONLY IF ENDED (FOR EVERYONE) */}
                            {isEnded && (
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasVoted && !isEnded && (
                <div className="bg-green-50 p-3 text-center border-t border-green-100">
                    <p className="text-green-700 text-xs font-semibold flex items-center justify-center">
                        <i className="fas fa-check-circle mr-2"></i> {t('voteCastOnChain')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ElectionCard;
