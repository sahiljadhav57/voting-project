const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidateId: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    voterHash: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Ensure one vote per user per election
voteSchema.index({ electionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
