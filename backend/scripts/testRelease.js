const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

require('../models/User');
require('../models/Order');
require('../models/Product');
require('../models/Notification');
require('../models/Dispute');
require('../models/Transaction');

const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Payout = require('../models/Payout');
    const Order = require('../models/Order');
    const User = require('../models/User');
    const Dispute = require('../models/Dispute');
    const stripeConnectService = require('../services/stripeConnectService');
    const exchangeRateService = require('../services/exchangeRateService');
    const { getSellerStat } = require('../utils/orderLifecycleUtils');
    const { createNotification } = require('../controllers/notificationController');

    const payout = await Payout.findOne().populate('seller').populate('order');
    const order = payout.order;
    const seller = payout.seller;

    console.log('Step 1: payout.status:', payout.status, '| released:', !!payout.releasedAt);
    console.log('Step 2: netAmount:', payout.netAmount);
    console.log('Step 3: order.status:', order?.status, '| paymentStatus:', order?.paymentStatus);

    const sellerStat = getSellerStat(order, payout.seller);
    console.log('  sellerStat.status:', sellerStat?.status);

    console.log('Step 4: Seller stripe:', seller.stripeAccountId, '| status:', seller.stripeAccountStatus);
    console.log('  charges:', seller.stripeChargesEnabled, '| payouts:', seller.stripePayoutsEnabled, '| onboarding:', seller.stripeOnboardingCompleted);

    console.log('Step 5: syncAccountStatus...');
    try {
        await stripeConnectService.syncAccountStatus(seller._id);
        const refreshed = await User.findById(seller._id);
        console.log('  Refreshed status:', refreshed.stripeAccountStatus);
        console.log('  charges:', refreshed.stripeChargesEnabled, '| payouts:', refreshed.stripePayoutsEnabled);

        if (refreshed.stripeAccountStatus !== 'Verified') {
            console.log('  FAIL: Not Verified, would stop here');
        }
    } catch (e) {
        console.log('  syncAccountStatus error:', e.message);
    }

    console.log('Step 6: Exchange rate...');
    try {
        const conversion = await exchangeRateService.convertPkrToEur(payout.netAmount);
        console.log('  OK:', JSON.stringify(conversion));
    } catch (e) {
        console.log('  ERR:', e.message);
    }

    console.log('Step 7: Stripe Transfer (dry test)...');
    const refreshedSeller = await User.findById(seller._id);
    try {
        const transfer = await stripeConnectService.createTransferToConnectedAccount(
            refreshedSeller.stripeAccountId, 1, 'eur', 'TEST'
        );
        console.log('  Transfer OK:', transfer.id);
    } catch (e) {
        console.log('  Transfer ERR:', e.message);
        console.log('  Error type:', e.type);
        console.log('  Is next error?', e.message === 'next is not a function');
    }

    console.log('Step 8: Test createNotification...');
    try {
        await createNotification(seller._id, 'Test notification', 'alert', '/test');
        console.log('  Notification OK');
    } catch (e) {
        console.log('  Notification ERR:', e.message);
    }

    process.exit(0);
}

test().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
