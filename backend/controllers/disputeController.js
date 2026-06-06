const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { refundEscrowForSeller } = require('../services/walletService');

const OPEN_STATUSES = ['open', 'under_review', 'investigating', 'awaiting_seller', 'seller_responded'];

function userId(user) {
    return (user?._id || user)?.toString();
}

function orderShortId(order) {
    const id = order?._id || order;
    return String(id).slice(-6).toUpperCase();
}

function appendTimeline(dispute, { action, message, userId: by, role, visibleTo = 'all' }) {
    if (!dispute.timeline) dispute.timeline = [];
    dispute.timeline.push({
        action,
        message: message || '',
        by,
        role,
        visibleTo,
        createdAt: new Date()
    });
}

async function populateDispute(query) {
    return query
        .populate('order', 'totalAmount status paymentMethod createdAt')
        .populate('buyer', 'name email role businessDetails')
        .populate('seller', 'name email businessDetails')
        .populate('timeline.by', 'name role');
}

async function notifyUser(recipientId, message, link) {
    if (!recipientId) return;
    await createNotification(recipientId, message, 'dispute', link);
}

async function notifyAdmins(message, link, excludeId) {
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
        if (excludeId && admin._id.toString() === excludeId) continue;
        await notifyUser(admin._id, message, link);
    }
}

function buyerOrderLink(orderId, buyerRole) {
    return buyerRole === 'manufacturer'
        ? `/wholesaler/orders/${orderId}`
        : `/wholesaler/orders/${orderId}`;
}

// @desc    Create dispute (buyer)
// @route   POST /api/disputes
exports.createDispute = async (req, res) => {
    try {
        const { orderId, sellerId, reason, evidence, evidenceImages, notes } = req.body;
        const buyerId = userId(req.user);

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (userId(order.buyer) !== buyerId) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (!['wholesaler', 'manufacturer'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Only buyers can open disputes' });
        }

        let targetSellerId = sellerId;
        if (!targetSellerId && order.sellerStats?.length === 1) {
            targetSellerId = order.sellerStats[0].seller;
        }
        if (!targetSellerId) {
            return res.status(400).json({
                success: false,
                error: 'Please select which seller this dispute is for.'
            });
        }

        const sellerStat = order.sellerStats.find((s) => userId(s.seller) === targetSellerId.toString());
        if (!sellerStat) {
            return res.status(400).json({ success: false, error: 'Seller not found on this order.' });
        }

        const existingOpen = await Dispute.findOne({
            order: orderId,
            buyer: buyerId,
            seller: targetSellerId,
            status: { $in: OPEN_STATUSES }
        });
        if (existingOpen) {
            return res.status(400).json({ success: false, error: 'An open dispute already exists for this seller on this order.' });
        }

        const images = [];
        if (evidence) images.push(evidence);
        if (Array.isArray(evidenceImages)) {
            evidenceImages.forEach((u) => {
                if (u && !images.includes(u)) images.push(u);
            });
        }

        const refundAmount = Number(sellerStat.sellerReceivable ?? sellerStat.subtotal ?? 0);
        const shortId = orderShortId(order);

        const dispute = await Dispute.create({
            order: orderId,
            buyer: buyerId,
            seller: targetSellerId,
            reason,
            evidence: images[0],
            evidenceImages: images,
            notes,
            refundAmount,
            status: 'open',
            timeline: [{
                action: 'opened',
                message: `Buyer reported: ${reason}. ${notes || ''}`.trim(),
                by: buyerId,
                role: req.user.role,
                visibleTo: 'all',
                createdAt: new Date()
            }]
        });

        const transactions = await Transaction.find({ order: orderId, status: 'Pending' });
        for (const tx of transactions) {
            tx.status = 'Hold';
            await tx.save();
        }

        const orderLink = buyerOrderLink(orderId, req.user.role);
        const sellerMsg = `Issue reported on order #${shortId}: "${reason}". Please respond within 48 hours or admin may process a refund.`;
        const adminMsg = `New dispute on order #${shortId} — ${reason} (PKR ${refundAmount.toLocaleString()}).`;

        await notifyUser(targetSellerId, sellerMsg, '/manufacturer/disputes');
        await notifyAdmins(adminMsg, '/admin/disputes', buyerId);

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get single dispute
// @route   GET /api/disputes/:id
exports.getDispute = async (req, res) => {
    try {
        const dispute = await populateDispute(Dispute.findById(req.params.id));
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }

        const uid = userId(req.user);
        const isBuyer = userId(dispute.buyer) === uid;
        const isSeller = userId(dispute.seller) === uid;
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const data = dispute.toObject();
        if (!isAdmin) {
            data.timeline = (data.timeline || []).filter(
                (t) => t.visibleTo === 'all' || t.visibleTo === req.user.role || (isBuyer && t.visibleTo === 'buyer') || (isSeller && t.visibleTo === 'seller')
            );
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getMyDisputes = async (req, res) => {
    try {
        const disputes = await populateDispute(
            Dispute.find({ buyer: userId(req.user) }).sort('-createdAt')
        );
        res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getSellerDisputes = async (req, res) => {
    try {
        const sellerId = userId(req.user);
        const disputes = await populateDispute(
            Dispute.find({ seller: sellerId }).sort('-createdAt')
        );
        res.status(200).json({ success: true, count: disputes.length, data: disputes });
    } catch (error) {
        console.error('[disputes] getSellerDisputes:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getAdminDisputes = async (req, res) => {
    try {
        const disputes = await populateDispute(Dispute.find().sort('-createdAt'));
        res.status(200).json({ success: true, count: disputes.length, data: disputes || [] });
    } catch (error) {
        console.error('[disputes] getAdminDisputes:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

const SELLER_CAN_REPLY = ['open', 'awaiting_seller', 'seller_responded', 'under_review', 'investigating'];
const BUYER_CAN_REPLY = ['open', 'awaiting_seller', 'seller_responded', 'under_review', 'investigating'];

// @desc    Buyer adds a follow-up message
// @route   PUT /api/disputes/:id/buyer/respond
exports.buyerRespond = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter a message.' });
        }

        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (userId(dispute.buyer) !== userId(req.user)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        if (['refunded', 'rejected', 'resolved'].includes(dispute.status)) {
            return res.status(400).json({ success: false, error: 'This dispute is already closed.' });
        }
        if (!BUYER_CAN_REPLY.includes(dispute.status)) {
            return res.status(400).json({ success: false, error: 'You cannot reply in the current dispute state.' });
        }

        appendTimeline(dispute, {
            action: 'buyer_reply',
            message: message.trim(),
            userId: userId(req.user),
            role: req.user.role
        });
        dispute.status = 'under_review';
        await dispute.save();

        const shortId = orderShortId(dispute.order);
        await notifyUser(
            dispute.seller,
            `Buyer replied on dispute #${shortId}. Please review and respond if needed.`,
            '/manufacturer/disputes'
        );
        await notifyAdmins(`Buyer replied on dispute #${shortId}.`, '/admin/disputes', userId(req.user));

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Seller responds to dispute (no refund yet)
// @route   PUT /api/disputes/:id/seller/respond
exports.sellerRespond = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ success: false, error: 'Please provide a response message.' });
        }

        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (userId(dispute.seller) !== userId(req.user)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        if (['refunded', 'rejected', 'resolved'].includes(dispute.status)) {
            return res.status(400).json({ success: false, error: 'This dispute is already closed.' });
        }
        if (!SELLER_CAN_REPLY.includes(dispute.status)) {
            return res.status(400).json({ success: false, error: 'You cannot respond in the current dispute state.' });
        }

        dispute.sellerResponse = { message: message.trim(), respondedAt: new Date() };
        dispute.status = 'seller_responded';
        appendTimeline(dispute, {
            action: 'seller_response',
            message: message.trim(),
            userId: userId(req.user),
            role: 'manufacturer'
        });
        await dispute.save();

        const shortId = orderShortId(dispute.order);
        await notifyUser(dispute.buyer, `Seller responded on dispute #${shortId}. Check your order for updates.`, buyerOrderLink(dispute.order._id, 'wholesaler'));
        await notifyAdmins(`Seller responded on dispute #${shortId}.`, '/admin/disputes', userId(req.user));

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Seller approves refund immediately
// @route   PUT /api/disputes/:id/seller/refund
exports.sellerRefund = async (req, res) => {
    try {
        const { message } = req.body;
        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (userId(dispute.seller) !== userId(req.user)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        if (dispute.status === 'refunded') {
            return res.status(400).json({ success: false, error: 'Already refunded.' });
        }

        const order = dispute.order;
        let refundResult = { amount: dispute.refundAmount };
        if (order?.paymentMethod === 'platform_wallet') {
            refundResult = await refundEscrowForSeller(order._id, dispute.seller);
        }

        if (message?.trim()) {
            dispute.sellerResponse = { message: message.trim(), respondedAt: new Date() };
        }
        dispute.status = 'refunded';
        dispute.resolution = message?.trim() || 'Seller approved refund to buyer.';
        dispute.refundAmount = refundResult.amount ?? dispute.refundAmount;
        appendTimeline(dispute, {
            action: 'seller_refund',
            message: dispute.resolution,
            userId: userId(req.user),
            role: 'manufacturer'
        });
        await dispute.save();

        if (order) {
            if (order.sellerStats?.length) {
                const stat = order.sellerStats.find((s) => userId(s.seller) === userId(dispute.seller));
                if (stat) stat.status = 'refunded';
            }
            order.paymentStatus = 'refunded';
            order.status = order.status === 'completed' ? order.status : 'cancelled';
            await order.save();
        }

        try {
            const { markPayoutsRefundedForOrder } = require('../utils/payoutSync');
            await markPayoutsRefundedForOrder(order._id, dispute.seller);
        } catch (payoutErr) {
            console.error('[payout] dispute refund sync:', payoutErr.message);
        }

        const shortId = orderShortId(order);
        await notifyUser(
            dispute.buyer,
            `Refund of PKR ${(dispute.refundAmount || 0).toLocaleString()} issued for order #${shortId} (seller approved).`,
            buyerOrderLink(order._id, 'wholesaler')
        );
        await notifyAdmins(`Seller refunded dispute #${shortId}.`, '/admin/disputes', userId(req.user));

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated, refund: refundResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Admin asks seller to respond before forced refund
// @route   PUT /api/disputes/:id/admin/request-seller
exports.adminRequestSellerResponse = async (req, res) => {
    try {
        const { message, hours = 48 } = req.body;
        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }

        const deadline = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);
        dispute.status = 'awaiting_seller';
        dispute.sellerRespondDeadline = deadline;
        const adminMsg = message?.trim() || 'Please respond to the buyer’s claim with your side and any proof. If no response, admin may refund the buyer from your wallet.';
        appendTimeline(dispute, {
            action: 'admin_request_seller',
            message: adminMsg,
            userId: userId(req.user),
            role: 'admin',
            visibleTo: 'all'
        });
        await dispute.save();

        const shortId = orderShortId(dispute.order);
        await notifyUser(
            dispute.seller,
            `Action required: respond to dispute #${shortId} by ${deadline.toLocaleString()}.`,
            '/manufacturer/disputes'
        );
        await notifyUser(
            dispute.buyer,
            `We asked the seller to respond to your claim on order #${shortId}. You will be updated soon.`,
            buyerOrderLink(dispute.order._id, 'wholesaler')
        );

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Admin message to buyer or seller
// @route   POST /api/disputes/:id/admin/message
exports.adminMessage = async (req, res) => {
    try {
        const { target, message } = req.body;
        if (!message?.trim() || !['buyer', 'seller'].includes(target)) {
            return res.status(400).json({ success: false, error: 'Target (buyer|seller) and message required.' });
        }

        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }

        dispute.status = dispute.status === 'open' ? 'under_review' : dispute.status;
        appendTimeline(dispute, {
            action: 'admin_message',
            message: message.trim(),
            userId: userId(req.user),
            role: 'admin',
            visibleTo: target
        });
        await dispute.save();

        const shortId = orderShortId(dispute.order);
        const recipient = target === 'buyer' ? dispute.buyer : dispute.seller;
        const link = target === 'buyer' ? buyerOrderLink(dispute.order._id, 'wholesaler') : '/manufacturer/disputes';
        await notifyUser(recipient, `GearUp support (order #${shortId}): ${message.trim()}`, link);

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Admin reject buyer claim (false report / resolved without refund)
// @route   PUT /api/disputes/:id/admin/reject
exports.adminRejectDispute = async (req, res) => {
    try {
        const { resolution, messageToBuyer, messageToSeller } = req.body;
        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }
        if (dispute.status === 'refunded') {
            return res.status(400).json({ success: false, error: 'Already refunded.' });
        }

        dispute.status = 'rejected';
        dispute.resolution = resolution || 'Claim reviewed — refund not approved.';
        appendTimeline(dispute, {
            action: 'admin_reject',
            message: dispute.resolution,
            userId: userId(req.user),
            role: 'admin'
        });
        await dispute.save();

        const transactions = await Transaction.find({ order: dispute.order._id, status: 'Hold' });
        for (const tx of transactions) {
            tx.status = 'Pending';
            await tx.save();
        }

        const shortId = orderShortId(dispute.order);
        if (messageToBuyer?.trim()) {
            await notifyUser(dispute.buyer, `Dispute #${shortId}: ${messageToBuyer.trim()}`, buyerOrderLink(dispute.order._id, 'wholesaler'));
        } else {
            await notifyUser(dispute.buyer, `Your dispute on order #${shortId} was closed: ${dispute.resolution}`, buyerOrderLink(dispute.order._id, 'wholesaler'));
        }
        if (messageToSeller?.trim()) {
            await notifyUser(dispute.seller, `Dispute #${shortId} closed in seller favor: ${messageToSeller.trim()}`, '/manufacturer/disputes');
        }

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Admin force refund from seller wallet
// @route   PUT /api/disputes/:id/refund
exports.adminRefundDispute = async (req, res) => {
    try {
        const { resolution } = req.body;
        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }
        if (dispute.status === 'refunded') {
            return res.status(400).json({ success: false, error: 'Refund already processed.' });
        }

        const order = dispute.order;
        let refundResult = { amount: dispute.refundAmount };
        if (order?.paymentMethod === 'platform_wallet') {
            refundResult = await refundEscrowForSeller(order._id, dispute.seller);
        }

        dispute.status = 'refunded';
        dispute.resolution = resolution || 'Admin approved refund — amount returned to buyer wallet.';
        dispute.refundAmount = refundResult.amount ?? dispute.refundAmount;
        appendTimeline(dispute, {
            action: 'admin_refund',
            message: dispute.resolution,
            userId: userId(req.user),
            role: 'admin'
        });
        await dispute.save();

        if (order) {
            if (order.sellerStats?.length) {
                const stat = order.sellerStats.find((s) => userId(s.seller) === userId(dispute.seller));
                if (stat) stat.status = 'refunded';
            }
            order.paymentStatus = 'refunded';
            order.status = order.status === 'completed' ? order.status : 'cancelled';
            await order.save();
        }

        try {
            const { markPayoutsRefundedForOrder } = require('../utils/payoutSync');
            await markPayoutsRefundedForOrder(order._id, dispute.seller);
        } catch (payoutErr) {
            console.error('[payout] admin dispute refund sync:', payoutErr.message);
        }

        const shortId = orderShortId(order);
        await notifyUser(
            dispute.buyer,
            `Refund approved: PKR ${(dispute.refundAmount || 0).toLocaleString()} for order #${shortId}.`,
            buyerOrderLink(order._id, 'wholesaler')
        );
        await notifyUser(
            dispute.seller,
            `Admin processed refund PKR ${(dispute.refundAmount || 0).toLocaleString()} for order #${shortId} from your wallet.`,
            '/manufacturer/disputes'
        );

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated, refund: refundResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateDisputeStatus = async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const dispute = await Dispute.findById(req.params.id).populate('order');
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }

        dispute.status = status;
        if (resolution) dispute.resolution = resolution;
        appendTimeline(dispute, {
            action: 'status_change',
            message: `Status set to ${status}. ${resolution || ''}`.trim(),
            userId: userId(req.user),
            role: 'admin'
        });
        await dispute.save();

        if (status === 'resolved' || status === 'rejected') {
            const transactions = await Transaction.find({ order: dispute.order._id, status: 'Hold' });
            for (const tx of transactions) {
                tx.status = 'Pending';
                await tx.save();
            }
        }

        const populated = await populateDispute(Dispute.findById(dispute._id));
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
