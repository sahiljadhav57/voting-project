const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');
const Block = require('../models/Block');
const { protect, adminOnly } = require('../middleware/auth');
const { createBlock, sha256Hash } = require('../utils/blockchain');

// @route   POST /api/votes
// @desc    Cast a vote
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { electionId, candidateId, walletAddress } = req.body;

        // Validate input
        if (!electionId || !candidateId || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if election exists
        const election = await Election.findById(electionId);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Check if election is active
        if (election.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Election is not active'
            });
        }

        // Check if user has already voted
        if (req.user.hasVoted.get(electionId.toString())) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted in this election'
            });
        }

        // Check if candidate exists
        const candidate = election.candidates.find(c => c.id === candidateId);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Create voter hash
        const voterHash = sha256Hash(req.user.username + walletAddress);

        // Create vote record
        const vote = await Vote.create({
            electionId,
            candidateId,
            userId: req.user._id,
            voterHash,
            walletAddress
        });

        // Update candidate vote count
        candidate.votes += 1;
        await election.save();

        // Update user's hasVoted map
        req.user.hasVoted.set(electionId.toString(), true);
        await req.user.save();

        // Add to blockchain
        const blockCount = await Block.countDocuments();
        const lastBlock = await Block.findOne().sort({ index: -1 });
        const prevHash = lastBlock ? lastBlock.hash : '0';

        const newBlock = createBlock(
            blockCount,
            {
                type: 'VOTE',
                electionId,
                candidateId,
                voter: req.user.username,
                voterHash
            },
            prevHash
        );

        await Block.create(newBlock);

        res.status(201).json({
            success: true,
            message: 'Vote cast successfully',
            data: {
                voteId: vote._id,
                blockHash: newBlock.hash
            }
        });
    } catch (error) {
        // Handle duplicate vote error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted in this election'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/votes/my-votes
// @desc    Get user's voting history
// @access  Private
router.get('/my-votes', protect, async (req, res) => {
    try {
        const votes = await Vote.find({ userId: req.user._id })
            .populate('electionId', 'title description')
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: votes.length,
            data: votes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/votes/election/:electionId
// @desc    Get all votes for an election
// @access  Private (Admin only)
router.get('/election/:electionId', protect, adminOnly, async (req, res) => {
    try {
        const votes = await Vote.find({ electionId: req.params.electionId })
            .populate('userId', 'username region')
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: votes.length,
            data: votes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
