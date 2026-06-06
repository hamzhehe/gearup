const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Optionally attach req.user when a valid Bearer token is present.
 * Never fails; req.user is null for guests or invalid tokens.
 * Used for marketplace product reads where rules depend on the caller.
 */
exports.optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }
    req.user = null;
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
            req.user = user;
        }
    } catch {
        // Treat as anonymous for public listing behavior
    }
    next();
};

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        console.log("Token Missing in Auth Middleware Headers!");
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (token missing)' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token Decoded Successfully:", decoded);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.log(`User not found in database for ID: ${decoded.id}`);
            return res.status(401).json({ success: false, error: `Not authorized to access this route (user not found with ID ${decoded.id})` });
        }

        console.log("User Role:", req.user.role);
        console.log("Auth User:", req.user);
        console.log("Token:", token);

        if (req.user.isBlocked) {
            return res.status(403).json({ success: false, error: 'Your account has been blocked.' });
        }

        next();
    } catch (err) {
        console.log("Token Verification Error:", err.message);
        return res.status(401).json({ success: false, error: `Not authorized to access this route (token verification failed: ${err.message})` });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(`Authorization failed. Required roles: ${JSON.stringify(roles)}. User role: ${req.user?.role}`);
            return res.status(403).json({
                success: false,
                error: `User role ${req.user?.role || 'undefined'} is not authorized to access this route (requires: ${roles.join(', ')})`
            });
        }
        next();
    };
};
