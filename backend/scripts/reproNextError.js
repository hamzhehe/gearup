const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Load dependent models first so populate() has registered schemas
    require('../models/User');
    require('../models/Order');

    // Load the real Payout model (registers pre('validate') hook)
    const Payout = require('../models/Payout');

    const payout = await Payout.findOne().populate('seller').populate('order');
    if (!payout) {
        console.log('No payout found in DB — nothing to validate.');
        await mongoose.disconnect();
        process.exit(0);
    }

    console.log('Payout found:', payout._id.toString(), '| status:', payout.status);

    // validate() runs pre('validate') middleware WITHOUT writing to the DB.
    try {
        await payout.validate();
        console.log('validate() OK — pre-validate hook completed without error.');
        process.exit(0);
    } catch (err) {
        console.log('validate() FAILED:', err.message);
        if (err.message === 'next is not a function') {
            console.log('ROOT CAUSE CONFIRMED: Payout pre(validate) hook calls next() which is no longer provided by mongoose 9.');
            process.exit(3);
        }
        process.exit(4);
    }
}

run().catch((e) => {
    console.error('FATAL:', e.message);
    process.exit(1);
});
