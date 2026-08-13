const mongoose = require('mongoose');

const WithdrawRequestSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['bank_transfer', 'jazzcash', 'easypaisa'],
        required: true
    },
    accountDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String, // Optional, for bank transfers
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    adminNotes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Mongoose 9 no longer provides a `next` callback to middleware hooks.
WithdrawRequestSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('WithdrawRequest', WithdrawRequestSchema);
