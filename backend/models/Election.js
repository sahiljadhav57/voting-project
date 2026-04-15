const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '👤'
    },
    photo: {
        type: String, // URL or path to uploaded photo
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    partySymbol: {
        type: String, // URL or path to party symbol image
        default: null
    },
    manifesto: {
        type: String, // URL or path to manifesto PDF
        default: null
    },
    votes: {
        type: Number,
        default: 0
    }
});

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide election title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide election description']
    },
    candidates: [candidateSchema],
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide end date']
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Ended'],
        default: 'Pending'
    },
    archived: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate winner
electionSchema.methods.getWinner = function () {
    if (this.candidates.length === 0) return null;

    return this.candidates.reduce((prev, current) =>
        (prev.votes > current.votes) ? prev : current
    );
};

// Method to calculate total votes
electionSchema.methods.getTotalVotes = function () {
    return this.candidates.reduce((acc, curr) => acc + curr.votes, 0);
};

module.exports = mongoose.model('Election', electionSchema);
