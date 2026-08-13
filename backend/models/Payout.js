const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    paymentIntentId: {
        type: String,
        default: null,
        index: true
    },
    transferId: {
        type: String,
        default: null,
        index: true
    },
    payoutId: {
        type: String,
        default: null,
        index: true
    },
    grossAmount: {
        type: Number,
        required: true,
        default: 0
    },
    platformCommission: {
        type: Number,
        required: true,
        default: 0
    },
    stripeFee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'pkr'
    },
    status: {
        type: String,
        enum: ['Pending', 'Released', 'Held', 'Failed', 'Cancelled'],
        default: 'Pending',
        index: true,
        set: (value) => {
            const raw = String(value || '').trim();
            if (!raw) return raw;
            const normalized = raw.toLowerCase();
            if (['approved'].includes(normalized)) return 'Pending';
            if (['paid'].includes(normalized)) return 'Released';
            if (normalized === 'holding') return 'Held';
            if (normalized === 'canceled') return 'Cancelled';
            if (normalized === 'held') return 'Held';
            if (normalized === 'released') return 'Released';
            return raw;
        }
    },
    stripeStatus: {
        type: String,
        default: null
    },
    disputeHold: {
        type: Boolean,
        default: false,
        index: true
    },
    disputeHoldReason: {
        type: String,
        default: ''
    },
    releasedAt: {
        type: Date,
        default: null
    },
    releasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    payoutCurrency: {
        type: String,
        default: 'pkr'
    },
    transferredAmountEur: {
        type: Number,
        default: null
    },
    exchangeRateUsed: {
        type: Number,
        default: null
    },
    stripeTransferCurrency: {
        type: String,
        default: 'eur'
    },
    stripeTransferId: {
        type: String,
        default: null
    },
    transferError: {
        type: String,
        default: null
    }
});

function normalizePayoutStatusValue(value) {
    const raw = String(value || '').trim();
    if (!raw) return raw;
    const normalized = raw.toLowerCase();
    if (['approved'].includes(normalized)) return 'Pending';
    if (['paid'].includes(normalized)) return 'Released';
    if (normalized === 'holding') return 'Held';
    if (normalized === 'canceled') return 'Cancelled';
    if (normalized === 'held') return 'Held';
    if (normalized === 'released') return 'Released';
    return raw;
}

// Mongoose 9 no longer provides a `next` callback to middleware hooks;
// the hook must complete synchronously (or return a promise) instead.
PayoutSchema.pre('validate', function () {
    if (this.status) {
        this.status = normalizePayoutStatusValue(this.status);
    }
});

module.exports = mongoose.model('Payout', PayoutSchema);
