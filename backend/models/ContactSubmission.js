const mongoose = require('mongoose');

const ContactSubmissionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['general', 'sales', 'support', 'demo'],
        default: 'general'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactSubmission', ContactSubmissionSchema);
