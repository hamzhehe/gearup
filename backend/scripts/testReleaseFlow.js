const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const mongoose = require('mongoose');

const PAYOUT_ID = '6a74b79e16e5ed2da9772f02';
const BASE = 'http://127.0.0.1:5000';

function makeToken(userId, role) {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function api(method, urlPath, { token, body } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${BASE}${urlPath}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    return { status: res.status, data };
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: undefined });
    const db = mongoose.connection.db;

    const admin = await db.collection('users').findOne({ role: 'admin' }, { projection: { _id: 1 } });
    const adminToken = makeToken(admin._id.toString(), 'admin');

    // Snapshot the payout + notifications so we can restore after the test
    const before = await db.collection('payouts').findOne({ _id: new mongoose.Types.ObjectId(PAYOUT_ID) });
    const notifBefore = await db.collection('notifications').countDocuments({});

    console.log('=== BEFORE ===');
    console.log('payout:', before.status, '| releasedAt:', before.releasedAt, '| transferId:', before.transferId);

    // Stub ONLY the external Stripe transfer + exchange-rate network calls.
    // Everything else in the controller (validations, auth, DB writes, response) is REAL.
    const payoutController = require('../controllers/payoutController');
    const stripeConnectService = require('../services/stripeConnectService');
    const exchangeRateService = require('../services/exchangeRateService');

    const stubTransferId = `tr_test_gearup_${Date.now()}`;
    stripeConnectService.createTransferToConnectedAccount = async () => ({ id: stubTransferId });
    exchangeRateService.convertPkrToEur = async () => ({
        netAmountPkr: before.netAmount,
        pkrPerEur: 300,
        amountEur: Math.round((before.netAmount / 300) * 100) / 100,
        amountEurCents: Math.round((before.netAmount / 300) * 100)
    });

    let captured = null;
    const res = {
        status(code) { this.code = code; return this; },
        json(body) { captured = { code: this.code, body }; return this; }
    };
    const req = { params: { id: PAYOUT_ID }, user: { id: admin._id.toString() } };

    console.log('\n=== TEST 1: real controller, valid release ===');
    await payoutController.releasePayout(req, res);
    console.log('response:', captured.code, JSON.stringify({ success: captured.body.success, message: captured.body.message }));

    const after = await db.collection('payouts').findOne({ _id: new mongoose.Types.ObjectId(PAYOUT_ID) });
    console.log('DB status:', after.status, '| releasedAt:', after.releasedAt, '| releasedBy:', after.releasedBy && after.releasedBy.toString(), '| transferId:', after.transferId, '| transferError:', after.transferError);

    console.log('\n=== TEST 2: second release attempt (must be 409) ===');
    captured = null;
    await payoutController.releasePayout(req, res);
    console.log('response:', captured.code, JSON.stringify({ success: captured.body.success, error: captured.body.error }));

    console.log('\n=== metrics via admin list API ===');
    const r = await api('GET', '/api/payouts/admin/list', { token: adminToken });
    console.log('metrics:', JSON.stringify(r.data && r.data.metrics));

    console.log('\n=== RESTORE pre-test state ===');
    const notifAfter = await db.collection('notifications').countDocuments({});
    if (notifAfter > notifBefore) {
        const toDelete = await db.collection('notifications').find({}).sort({ createdAt: -1 }).limit(notifAfter - notifBefore).toArray();
        await db.collection('notifications').deleteMany({ _id: { $in: toDelete.map(n => n._id) } });
        console.log('removed', toDelete.length, 'test notification(s)');
    }
    const restored = await db.collection('payouts').updateOne(
        { _id: new mongoose.Types.ObjectId(PAYOUT_ID) },
        { $set: {
            status: before.status,
            releasedAt: before.releasedAt || null,
            releasedBy: before.releasedBy || null,
            transferId: before.transferId || null,
            stripeTransferId: before.stripeTransferId || null,
            transferError: before.transferError || null,
            transferredAmountEur: before.transferredAmountEur || null,
            exchangeRateUsed: before.exchangeRateUsed || null,
            stripeTransferCurrency: 'eur',
            notes: before.notes || ''
        } }
    );
    console.log('restore modifiedCount:', restored.modifiedCount);
    const verify = await db.collection('payouts').findOne({ _id: new mongoose.Types.ObjectId(PAYOUT_ID) });
    console.log('payout back to:', verify.status, '| releasedAt:', verify.releasedAt, '| transferId:', verify.transferId);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
