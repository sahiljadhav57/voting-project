const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Block = require('../models/Block');
const { protect, adminOnly } = require('../middleware/auth');
const { createBlock } = require('../utils/blockchain');
const upload = require('../middleware/upload');

// @route   GET /api/elections
// @desc    Get all elections
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const elections = await Election.find({ archived: { $ne: true } }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: elections.length,
            data: elections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/elections/:id
// @desc    Get single election
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }
        res.status(200).json({
            success: true,
            data: election
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/elections
// @desc    Create new election
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.fields([
    { name: 'candidatePhotos', maxCount: 10 },
    { name: 'partySymbols', maxCount: 10 },
    { name: 'manifestos', maxCount: 10 }
]), async (req, res) => {
    try {
        console.log('=== REQUEST DEBUG ===');
        console.log('req.body.candidates type:', typeof req.body.candidates);
        console.log('req.body.candidates:', req.body.candidates);

        const { title, description, startDate, endDate } = req.body;

        // Parse candidates - handle multiple formats
        let candidates = [];

        if (req.body.candidates) {
            if (typeof req.body.candidates === 'string') {
                // It's a JSON string, parse it
                try {
                    candidates = JSON.parse(req.body.candidates);
                    console.log('Parsed from JSON string');
                } catch (e) {
                    console.log('Failed to parse candidates as JSON:', e.message);
                }
            } else if (Array.isArray(req.body.candidates)) {
                // It's already an array
                candidates = req.body.candidates;
                console.log('Already an array');
            } else if (typeof req.body.candidates === 'object') {
                // It's an object, convert to array
                candidates = Object.values(req.body.candidates);
                console.log('Converted object to array');
            }
        }

        // Fallback: Try indexed format
        if (candidates.length === 0) {
            let i = 0;
            while (req.body[`candidates[${i}][name]`]) {
                candidates.push({
                    name: req.body[`candidates[${i}][name]`],
                    party: req.body[`candidates[${i}][party]`],
                    bio: req.body[`candidates[${i}][bio]`] || '',
                    avatar: req.body[`candidates[${i}][avatar]`] || '👤'
                });
                i++;
            }
            if (i > 0) console.log('Parsed from indexed format');
        }

        console.log('Final candidates:', candidates);
        console.log('Candidates count:', candidates.length);

        // Validate input
        if (!title || !description || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, start date, and end date'
            });
        }

        if (!candidates || candidates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please add at least one candidate'
            });
        }

        // Process uploaded files
        const photos = req.files?.candidatePhotos || [];
        const symbols = req.files?.partySymbols || [];
        const manifestos = req.files?.manifestos || [];

        // Add IDs and file paths to candidates
        const candidatesWithIds = candidates.map((c, i) => ({
            name: c.name,
            party: c.party,
            bio: c.bio || '',
            avatar: c.avatar || '👤',
            id: Date.now() + i,
            votes: 0,
            photo: photos[i] ? `/uploads/photos/${photos[i].filename}` : '',
            partySymbol: symbols[i] ? `/uploads/symbols/${symbols[i].filename}` : '',
            manifesto: manifestos[i] ? `/uploads/manifestos/${manifestos[i].filename}` : ''
        }));

        // Create election
        const election = await Election.create({
            title,
            description,
            startDate,
            endDate,
            candidates: candidatesWithIds,
            createdBy: req.user._id,
            status: 'Pending'
        });

        // Add to blockchain
        const blockCount = await Block.countDocuments();
        const lastBlock = await Block.findOne().sort({ index: -1 });
        const prevHash = lastBlock ? lastBlock.hash : '0';

        const newBlock = createBlock(
            blockCount,
            {
                type: 'CONTRACT_DEPLOY',
                electionId: election._id,
                title: election.title
            },
            prevHash
        );

        await Block.create(newBlock);

        console.log('Election created successfully!');
        res.status(201).json({
            success: true,
            data: election
        });
    } catch (error) {
        console.error('Error creating election:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PATCH /api/elections/:id/status
// @desc    Update election status
// @access  Private (Admin only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Active', 'Ended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        election.status = status;
        await election.save();

        // Add to blockchain
        const blockCount = await Block.countDocuments();
        const lastBlock = await Block.findOne().sort({ index: -1 });
        const prevHash = lastBlock ? lastBlock.hash : '0';

        const newBlock = createBlock(
            blockCount,
            {
                type: 'STATUS_CHANGE',
                electionId: election._id,
                status
            },
            prevHash
        );

        await Block.create(newBlock);

        res.status(200).json({
            success: true,
            data: election
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/elections/:id
// @desc    Delete election (only if ended)
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        if (election.status !== 'Ended') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete ended elections'
            });
        }

        await election.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Election deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PATCH /api/elections/:id/archive
// @desc    Archive an election
// @access  Private (Admin only)
router.patch('/:id/archive', protect, adminOnly, async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        election.archived = true;
        await election.save();

        res.status(200).json({
            success: true,
            data: election
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/elections/archived/all
// @desc    Get all archived elections
// @access  Private
router.get('/archived/all', protect, async (req, res) => {
    try {
        const elections = await Election.find({ archived: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: elections.length,
            data: elections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/elections/:electionId/candidates/:candidateId
// @desc    Delete a candidate from an election
// @access  Private (Admin only)
router.delete('/:electionId/candidates/:candidateId', protect, adminOnly, async (req, res) => {
    try {
        const election = await Election.findById(req.params.electionId);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        election.candidates = election.candidates.filter(c => c.id !== parseInt(req.params.candidateId));
        await election.save();

        res.status(200).json({
            success: true,
            data: election
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
