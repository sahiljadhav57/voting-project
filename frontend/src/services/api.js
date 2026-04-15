import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    requestOTP: (aadhaar) => api.post('/auth/request-otp', { aadhaar }),
    verifyOTP: (aadhaar, otp, region) => api.post('/auth/verify-otp', { aadhaar, otp, region }),
    adminLogin: (username, password) => api.post('/auth/admin-login', { username, password }),
    getCurrentUser: () => api.get('/auth/me')
};

// Elections API
export const electionsAPI = {
    getAll: () => api.get('/elections'),
    getById: (id) => api.get(`/elections/${id}`),
    create: (data) => api.post('/elections', data),
    updateStatus: (id, status) => api.patch(`/elections/${id}/status`, { status }),
    delete: (id) => api.delete(`/elections/${id}`),
    archive: (id) => api.patch(`/elections/${id}/archive`),
    getArchived: () => api.get('/elections/archived/all'),
    deleteCandidate: (electionId, candidateId) => api.delete(`/elections/${electionId}/candidates/${candidateId}`)
};

// Votes API
export const votesAPI = {
    castVote: (electionId, candidateId, walletAddress) =>
        api.post('/votes', { electionId, candidateId, walletAddress }),
    getMyVotes: () => api.get('/votes/my-votes'),
    getElectionVotes: (electionId) => api.get(`/votes/election/${electionId}`)
};

// Blockchain API
export const blockchainAPI = {
    getChain: () => api.get('/blockchain'),
    verifyChain: () => api.get('/blockchain/verify')
};

export default api;
