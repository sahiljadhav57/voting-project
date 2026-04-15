const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const { protect, adminOnly } = require('../middleware/auth');
const { validateBlockchain, createGenesisBlock } = require('../utils/blockchain');

// @route   GET /api/blockchain
// @desc    Get entire blockchain ledger
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const chain = await Block.find().sort({ index: 1 });

        // Initialize genesis block if chain is empty
        if (chain.length === 0) {
            const genesisBlock = createGenesisBlock();
            await Block.create(genesisBlock);

            return res.status(200).json({
                success: true,
                count: 1,
                data: [genesisBlock]
            });
        }

        res.status(200).json({
            success: true,
            count: chain.length,
            data: chain
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/blockchain/verify
// @desc    Verify blockchain integrity
// @access  Private (Admin only)
router.get('/verify', protect, adminOnly, async (req, res) => {
    try {
        const chain = await Block.find().sort({ index: 1 });

        if (chain.length === 0) {
            return res.status(200).json({
                success: true,
                valid: true,
                message: 'Blockchain is empty'
            });
        }

        const validation = validateBlockchain(chain);

        res.status(200).json({
            success: true,
            ...validation
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
