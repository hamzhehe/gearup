const ContactSubmission = require('../models/ContactSubmission');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.submitContact = async (req, res) => {
    try {
        const { name, email, company, message, type } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        if (!email || !String(email).trim()) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        if (!EMAIL_RE.test(String(email).trim())) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
        }
        if (!message || !String(message).trim()) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const allowedTypes = ['general', 'verification', 'sales', 'support', 'advertising', 'other', 'demo'];
        const inquiryType = allowedTypes.includes(type) ? type : 'general';

        await ContactSubmission.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            company: company ? String(company).trim() : '',
            message: String(message).trim(),
            type: inquiryType
        });

        res.status(201).json({
            success: true,
            message: 'Thank you. Your message has been received. We will respond within one business day.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Could not save your message' });
    }
};
