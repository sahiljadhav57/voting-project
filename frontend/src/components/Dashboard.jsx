import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { electionsAPI, blockchainAPI } from '../services/api';
import BlockchainViewer from './BlockchainViewer';
import ElectionCard from './ElectionCard';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('elections');
    const [elections, setElections] = useState([]);
    const [archivedElections, setArchivedElections] = useState([]);
    const [chain, setChain] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin State for new election
    const [newElection, setNewElection] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '', party: '', avatar: '👤', bio: '' }]
    });

    // Fetch elections and blockchain on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const promises = [
                electionsAPI.getAll(),
                blockchainAPI.getChain()
            ];

            if (user.role === 'admin') {
                promises.push(electionsAPI.getArchived());
            }

            const results = await Promise.all(promises);

            setElections(results[0].data.data);
            setChain(results[1].data.data);

            if (user.role === 'admin' && results[2]) {
                setArchivedElections(results[2].data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCandidate = () => {
        setNewElection({
            ...newElection,
            candidates: [...newElection.candidates, { name: '', party: '', avatar: '👤', bio: '' }]
        });
    };

    const handleRemoveCandidate = (index) => {
        if (newElection.candidates.length > 1) {
            const updated = newElection.candidates.filter((_, i) => i !== index);
            setNewElection({ ...newElection, candidates: updated });
        }
    };

    const handleCandidateChange = (index, field, value) => {
        const updated = [...newElection.candidates];
        updated[index][field] = value;
        setNewElection({ ...newElection, candidates: updated });
    };

    const handleCreateElection = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            // Add election basic info
            formData.append('title', newElection.title);
            formData.append('description', newElection.description);
            formData.append('startDate', newElection.startDate);
            formData.append('endDate', newElection.endDate);

            // Add candidates with files
            newElection.candidates.forEach((candidate, index) => {
                formData.append(`candidates[${index}][name]`, candidate.name);
                formData.append(`candidates[${index}][party]`, candidate.party);
                formData.append(`candidates[${index}][bio]`, candidate.bio || '');
                formData.append(`candidates[${index}][avatar]`, candidate.avatar || '👤');

                // Add files if they exist
                if (candidate.photoFile) {
                    formData.append(`candidatePhotos`, candidate.photoFile);
                }
                if (candidate.symbolFile) {
                    formData.append(`partySymbols`, candidate.symbolFile);
                }
                if (candidate.manifestoFile) {
                    formData.append(`manifestos`, candidate.manifestoFile);
                }
            });

            await electionsAPI.create(formData);

            // Reset form
            setNewElection({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                candidates: [{ name: '', party: '', avatar: '👤', bio: '' }]
            });

            // Switch to elections tab and refresh data
            setActiveTab('elections');
            fetchData();
            alert(t('electionCreated'));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create election');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await electionsAPI.updateStatus(id, status);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteElection = async (id) => {
        if (!window.confirm(t('confirmDelete'))) return;

        try {
            await electionsAPI.delete(id);
            fetchData();
            alert(t('electionDeleted'));
        } catch (error) {
            alert(error.response?.data?.message || t('onlyEndedElections'));
        }
    };

    const handleArchiveElection = async (id) => {
        try {
            await electionsAPI.archive(id);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to archive election');
        }
    };

    const handleVote = (electionId, candidateId) => {
        // Update local state optimistically
        setElections(elections.map(e => {
            if (e._id === electionId) {
                const updatedCandidates = e.candidates.map(c => {
                    if (c.id === candidateId) return { ...c, votes: c.votes + 1 };
                    return c;
                });
                return { ...e, candidates: updatedCandidates };
            }
            return e;
        }));

        // Update user's hasVoted
        user.hasVoted[electionId] = true;

        // Refresh blockchain
        fetchData();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <i className="fas fa-circle-notch animate-spin text-blue-600 text-3xl"></i>
                <p className="mt-4 text-slate-600">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BlockchainViewer chain={chain} />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'elections' && t('electionCenter')}
                    {activeTab === 'create' && t('createElection')}
                    {activeTab === 'history' && t('electionHistory')}
                    {activeTab === 'contract' && t('contract')}
                </h2>

                {user.role === 'admin' && (
                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('elections')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'elections' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t('manageElections')}
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t('createNew')}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fas fa-history mr-1"></i> {t('electionHistory')}
                        </button>
                        <button
                            onClick={() => setActiveTab('contract')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'contract' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fas fa-file-code mr-1"></i> {t('contract')}
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'contract' && user.role === 'admin' ? (
                <div className="bg-[#1e1e1e] rounded-xl shadow-lg border border-slate-700 p-0 overflow-hidden fade-in font-mono text-sm">
                    <div className="bg-[#2d2d2d] px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-slate-300"><i className="fab fa-ethereum text-purple-400 mr-2"></i>Voting.sol</span>
                        <span className="text-xs text-slate-500">Solidity 0.8.0</span>
                    </div>
                    <div className="p-4 overflow-auto text-slate-300 h-[500px]">
                        <pre>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string title;
        uint startDate;
        uint endDate;
        bool active;
        mapping(uint => Candidate) candidates;
        uint candidatesCount;
        mapping(address => bool) voters;
    }

    mapping(uint => Election) public elections;
    uint public electionsCount;
    address public admin;

    event ElectionCreated(uint id, string title);
    event Voted(uint electionId, uint candidateId, address voter);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function createElection(string memory _title, uint _start, uint _end) public onlyAdmin {
        electionsCount++;
        Election storage e = elections[electionsCount];
        e.id = electionsCount;
        e.title = _title;
        e.startDate = _start;
        e.endDate = _end;
        e.active = true;
        emit ElectionCreated(electionsCount, _title);
    }

    function addCandidate(uint _electionId, string memory _name) public onlyAdmin {
        Election storage e = elections[_electionId];
        e.candidatesCount++;
        e.candidates[e.candidatesCount] = Candidate(e.candidatesCount, _name, 0);
    }

    function vote(uint _electionId, uint _candidateId) public {
        Election storage e = elections[_electionId];
        require(block.timestamp >= e.startDate && block.timestamp <= e.endDate, "Election not active");
        require(!e.voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= e.candidatesCount, "Invalid candidate");

        e.voters[msg.sender] = true;
        e.candidates[_candidateId].voteCount++;

        emit Voted(_electionId, _candidateId, msg.sender);
    }
}`}</pre>
                    </div>
                </div>
            ) : activeTab === 'history' && user.role === 'admin' ? (
                <div className="fade-in">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {archivedElections.map(election => (
                            <ElectionCard
                                key={election._id}
                                election={election}
                                onVote={handleVote}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={handleDeleteElection}
                                isArchived={true}
                            />
                        ))}
                        {archivedElections.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                <i className="fas fa-archive text-4xl mb-4"></i>
                                <p>{t('noElections')}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'create' && user.role === 'admin' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 fade-in">
                    <form onSubmit={handleCreateElection} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">{t('electionDetails')}</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('title')}</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
                                    <textarea required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                        value={newElection.description} onChange={e => setNewElection({ ...newElection, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('startDate')}</label>
                                        <input required type="datetime-local" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newElection.startDate} onChange={e => setNewElection({ ...newElection, startDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('endDate')}</label>
                                        <input required type="datetime-local" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newElection.endDate} onChange={e => setNewElection({ ...newElection, endDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="text-lg font-semibold text-slate-800">{t('candidates')}</h3>
                                    <button type="button" onClick={handleAddCandidate} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        + {t('addCandidate')}
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {newElection.candidates.map((cand, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-xs text-slate-400 font-mono">#{idx + 1}</div>
                                                {newElection.candidates.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCandidate(idx)}
                                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title={t('deleteCandidate')}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input required placeholder={t('candidateName')} className="w-full px-3 py-2 bg-white border rounded focus:border-blue-500 outline-none text-sm"
                                                    value={cand.name} onChange={e => handleCandidateChange(idx, 'name', e.target.value)} />
                                                <input required placeholder={t('partyAffiliation')} className="w-full px-3 py-2 bg-white border rounded focus:border-blue-500 outline-none text-sm"
                                                    value={cand.party} onChange={e => handleCandidateChange(idx, 'party', e.target.value)} />
                                                <textarea placeholder={t('candidateBio')} className="w-full px-3 py-2 bg-white border rounded focus:border-blue-500 outline-none text-sm h-20 resize-none"
                                                    value={cand.bio} onChange={e => handleCandidateChange(idx, 'bio', e.target.value)} />

                                                {/* File Uploads */}
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-medium text-slate-600">{t('candidatePhoto')}</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => handleCandidateChange(idx, 'photoFile', e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-xs font-medium text-slate-600">{t('partySymbol')}</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => handleCandidateChange(idx, 'symbolFile', e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-xs font-medium text-slate-600">{t('manifesto')}</label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={e => handleCandidateChange(idx, 'manifestoFile', e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-end">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                                {t('deployElectionContract')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {elections.map(election => (
                        <ElectionCard
                            key={election._id}
                            election={election}
                            onVote={handleVote}
                            onUpdateStatus={handleUpdateStatus}
                            onDelete={handleDeleteElection}
                            onArchive={handleArchiveElection}
                        />
                    ))}
                    {elections.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <i className="fas fa-inbox text-4xl mb-4"></i>
                            <p>{t('noElections')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
