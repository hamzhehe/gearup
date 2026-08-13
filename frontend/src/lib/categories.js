/**
 * Centralized Category & Subcategory definitions for Frontend UI & Validation
 *
 * GearUp is a Cricket, Football & Protective Gear B2B sports goods marketplace.
 * Main Category = Sport/product group, Subcategory = Specific Product Type.
 * Keep this file in sync with backend/constants/categories.js
 */

export const CATEGORIES = [
    'Cricket',
    'Football',
    'Protective Gear',
];

export const CATEGORY_SUBCATEGORIES = {
    'Cricket': [
        // Cricket Bats
        'Hard Ball Cricket Bat',
        'Tennis Ball Bat',
        'Tape Ball Bat',
        'Junior Cricket Bat',
        'Training Cricket Bat',

        // Cricket Balls
        'Leather Cricket Ball',
        'Tennis Cricket Ball',
        'Tape Ball',
        'Training Cricket Ball',

        // Batting Equipment
        'Batting Gloves',
        'Batting Pads',
        'Batting Helmet',
        'Thigh Pad',
        'Arm Guard',
        'Chest Guard',
        'Abdominal Guard',

        // Wicket Keeping Equipment
        'Wicket Keeping Gloves',
        'Wicket Keeping Pads',
        'Wicket Keeping Helmet',

        // Ground Equipment
        'Cricket Stumps',
        'Cricket Bails',
        'Boundary Rope',
        'Cricket Training Equipment',

        // Bags & Footwear
        'Cricket Shoes',
        'Cricket Kit Bag',
        'Cricket Bat Bag',

        // Other Cricket Products
        'Cricket Clothing',
        'Cricket Accessories',
    ],

    'Football': [
        // Footballs
        'Match Football',
        'Training Football',
        'Futsal Ball',
        'Beach Football',
        'Mini Football',
        'Kids Football',

        // Football Shoes (FG=Firm Ground, SG=Soft Ground, AG=Artificial Ground, TF=Turf, IN=Indoor/Futsal)
        'Firm Ground Football Shoes',
        'Soft Ground Football Shoes',
        'Artificial Ground Football Shoes',
        'Turf Football Shoes',
        'Indoor/Futsal Football Shoes',

        // Goalkeeper Equipment
        'Goalkeeper Gloves',
        'Goalkeeper Protection',
        'Goalkeeper Training Equipment',

        // Football Goals & Nets
        'Football Goals',
        'Football Goal Nets',
        'Mini Football Goals',
        'Training Goals',

        // Football Training Equipment
        'Training Cones',
        'Training Poles',
        'Training Hurdles',
        'Agility Ladders',
        'Rebounders',
        'Football Training Equipment',

        // Football Accessories
        'Football Ball Pump',
        'Football Ball Bag',
        'Captain Armband',
        'Football Accessories',
    ],

    'Protective Gear': [
        // Head Protection
        'Sports Helmet',
        'Cricket Helmet',
        'Football Head Guard',

        // Body Protection
        'Chest Guard',
        'Rib Guard',
        'Body Protector',
        'Shoulder Guard',

        // Arm & Hand Protection
        'Arm Guard',
        'Elbow Guard',
        'Wrist Guard',
        'Hand Protector',

        // Leg Protection
        'Shin Guards',
        'Knee Guard',
        'Thigh Guard',
        'Leg Guard',
        'Ankle Guard',

        // Groin Protection
        'Abdominal Guard',
        'Groin Guard',
        'Protective Cup',

        // Other Protective Equipment
        'Mouth Guard',
        'Back Protector',
        'Sports Protective Gear',
    ],
};

export function getSubcategoriesForCategory(category) {
    if (!category) return [];
    const catTrimmed = String(category).trim();
    const matchKey = Object.keys(CATEGORY_SUBCATEGORIES).find(
        (key) => key.toLowerCase() === catTrimmed.toLowerCase()
    );
    if (matchKey) {
        return CATEGORY_SUBCATEGORIES[matchKey];
    }
    return [];
}

export function isValidCategorySubcategory(category, subcategory) {
    if (!category || !subcategory) return false;
    const allowed = getSubcategoriesForCategory(category);
    const subTrimmed = String(subcategory).trim().toLowerCase();
    return allowed.some((item) => item.toLowerCase() === subTrimmed);
}
