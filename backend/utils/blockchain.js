const crypto = require('crypto');

// Simple hash function for blockchain simulation
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16) + "x" + Math.random().toString(36).substring(2, 10);
};

// SHA-256 hash for more secure hashing
const sha256Hash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// Create a new block
const createBlock = (index, data, prevHash) => {
    const timestamp = Date.now();
    const blockData = {
        index,
        timestamp,
        data,
        prevHash
    };

    const hash = sha256Hash(blockData);

    return {
        ...blockData,
        hash
    };
};

// Validate blockchain integrity
const validateBlockchain = (chain) => {
    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const prevBlock = chain[i - 1];

        // Check if previous hash matches
        if (currentBlock.prevHash !== prevBlock.hash) {
            return {
                valid: false,
                error: `Block ${i} has invalid previous hash`
            };
        }

        // Recalculate hash and verify
        const recalculatedHash = sha256Hash({
            index: currentBlock.index,
            timestamp: currentBlock.timestamp,
            data: currentBlock.data,
            prevHash: currentBlock.prevHash
        });

        if (currentBlock.hash !== recalculatedHash) {
            return {
                valid: false,
                error: `Block ${i} has been tampered with`
            };
        }
    }

    return { valid: true };
};

// Initialize genesis block
const createGenesisBlock = () => {
    return createBlock(0, { type: 'GENESIS', info: 'System Init' }, '0');
};

module.exports = {
    simpleHash,
    sha256Hash,
    createBlock,
    validateBlockchain,
    createGenesisBlock
};
