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

export const formatPKRShort = (amount) => {
    // formatPKRShort now acts identical to formatPKR as per requirements to avoid shorthand.
    return formatPKR(amount);
};

export const calculateGrossProfit = (revenue, cogs) => {
    return revenue - cogs;
};

// Calculate common sales metrics for manufacturer
export const getSalesMetrics = (orders, userId) => {
    let totalRevenue = 0;
    let totalSalesCount = 0;

    orders.forEach(order => {
        // Find if user is seller in this order
        const myStats = order.sellerStats?.find(s => (s.seller?._id || s.seller) === userId);
        const myItems = order.items?.filter(i => (i.seller?._id || i.seller) === userId) || [];
        
        // If they are not seller here, skip
        if (!myStats && myItems.length === 0) return;

        const myStatus = (myStats?.status || order.status || '').toLowerCase();
        
        // Count all valid non-cancelled orders as revenue and sales
        if (myStatus !== 'cancelled' && myStatus !== 'refunded') {
            const revenue = myStats?.subtotal || myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalRevenue += revenue;
            totalSalesCount += 1;
        }
    });

    return { totalRevenue, totalSalesCount };
};

export const getPurchaseMetrics = (orders, userId) => {
    let totalPurchasesAmount = 0;
    let totalPurchasesCount = 0;

    orders.forEach(order => {
        // Buyer logic
        const buyerId = (order.buyer?._id || order.buyer?.id || order.buyer)?.toString();
        if (buyerId === userId) {
            const status = (order.status || '').toLowerCase();
            if (status !== 'cancelled' && status !== 'refunded') {
                totalPurchasesAmount += (order.totalAmount || 0);
                totalPurchasesCount += 1;
            }
        }
    });

    return { totalPurchasesAmount, totalPurchasesCount };
};
