import {
    isChartEligiblePurchaseOrder,
    isChartEligibleSellerOrder,
} from '@/lib/dashboardAnalytics';

/**
 * Format currency to Pakistani conventions (Crore, Lakh, regular format)
 * Handles negative values and returns absolute string with 'Net Loss' capability if needed.
 */
export const formatPKR = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'PKR 0';

    const isNegative = amount < 0;
    const absValue = Math.abs(amount);

    const formattedValue = absValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    if (isNegative) {
        return `-PKR ${formattedValue}`;
    }

    return `PKR ${formattedValue}`;
};

export const formatPKRShort = (amount) => formatPKR(amount);

export const calculateGrossProfit = (revenue, cogs) => revenue - cogs;

function resolveId(value) {
    return (value?._id || value?.id || value)?.toString() || null;
}

export const getSalesMetrics = (orders, userId) => {
    let totalRevenue = 0;
    let totalSalesCount = 0;
    const uid = resolveId(userId);

    orders.forEach((order) => {
        if (!uid || !isChartEligibleSellerOrder(order, uid)) return;

        const myStats = order.sellerStats?.find((s) => resolveId(s.seller) === uid);
        const myItems = order.items?.filter((i) => resolveId(i.seller) === uid) || [];

        if (!myStats && myItems.length === 0) return;

        const revenue =
            myStats?.subtotal ||
            myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalRevenue += revenue;
        totalSalesCount += 1;
    });

    return { totalRevenue, totalSalesCount };
};

export const getPurchaseMetrics = (orders, userId) => {
    let totalPurchasesAmount = 0;
    let totalPurchasesCount = 0;
    const uid = resolveId(userId);

    orders.forEach((order) => {
        if (!uid || !isChartEligiblePurchaseOrder(order, uid)) return;
        totalPurchasesAmount += order.totalAmount || 0;
        totalPurchasesCount += 1;
    });

    return { totalPurchasesAmount, totalPurchasesCount };
};

export { isChartEligibleSellerOrder, isChartEligiblePurchaseOrder } from '@/lib/dashboardAnalytics';
