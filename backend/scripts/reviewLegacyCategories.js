/**
 * Read-only report of products whose category/subcategory combination is NOT
 * part of the canonical GearUp catalog config (backend/constants/categories.js).
 *
 * These rows are intentionally preserved in the database — nothing is modified
 * or deleted. They simply need manual review so the seller can re-select a
 * valid subcategory the next time the product is edited.
 *
 * Usage (from backend/):
 *   node scripts/reviewLegacyCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getSubcategoriesForCategory } = require('../constants/categories');

async function main() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);

    const rows = await mongoose.connection.db
        .collection('products')
        .find(
            {},
            { projection: { name: 1, category: 1, subcategory: 1, sku: 1 } }
        )
        .toArray();

    const legacy = rows.filter((p) => {
        const allowed = getSubcategoriesForCategory(p.category || '');
        return !allowed.includes((p.subcategory || '').trim());
    });

    console.log(`Total products: ${rows.length}`);
    console.log(`Products with valid category/subcategory: ${rows.length - legacy.length}`);
    console.log(`Products requiring manual review: ${legacy.length}`);
    legacy.forEach((p) => {
        console.log(`  - ${p.name} | category="${p.category}" subcategory="${p.subcategory}" sku=${p.sku || 'N/A'}`);
    });

    await mongoose.disconnect();
}

main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
