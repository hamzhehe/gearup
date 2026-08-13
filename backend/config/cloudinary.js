const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath, override: true });

const cloudinary = require('cloudinary').v2;

const getRequiredEnv = (name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim() ? value.trim() : '';
};

const getCloudinaryConfigFromUrl = () => {
    const urlValue = getRequiredEnv('CLOUDINARY_URL');
    if (!urlValue) {
        return {};
    }

    try {
        const parsedUrl = new URL(urlValue);
        if (parsedUrl.protocol !== 'cloudinary:') {
            return {};
        }

        return {
            cloudName: parsedUrl.hostname || '',
            apiKey: decodeURIComponent(parsedUrl.username || ''),
            apiSecret: decodeURIComponent(parsedUrl.password || ''),
        };
    } catch (error) {
        console.warn('[CLOUDINARY] Could not parse CLOUDINARY_URL:', error.message);
        return {};
    }
};

const urlConfig = getCloudinaryConfigFromUrl();
const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME') || urlConfig.cloudName || '';
const apiKey = getRequiredEnv('CLOUDINARY_API_KEY') || urlConfig.apiKey || '';
const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET') || urlConfig.apiSecret || '';
const isConfigured = Boolean(cloudName && apiKey && apiSecret);

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

let lastVerification = null;

const verifyCloudinaryConfig = async (options = {}) => {
    const { log = true, throwOnFailure = false } = options;

    if (!isConfigured) {
        const message = 'Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.';
        if (log) {
            console.warn(`[CLOUDINARY] ${message}`);
        }
        if (throwOnFailure) {
            throw new Error(message);
        }
        return false;
    }

    try {
        const result = await cloudinary.api.ping();
        lastVerification = { ok: true, result };
        if (log) {
            console.log('[CLOUDINARY] Configuration verified successfully.');
        }
        return true;
    } catch (error) {
        const message = `Cloudinary verification failed: ${error.message}`;
        if (log) {
            console.error(`[CLOUDINARY] ${message}`);
        }
        if (throwOnFailure) {
            throw new Error(message);
        }
        return false;
    }
};

const getCloudinaryStatus = () => ({
    configured: isConfigured,
    cloudName: cloudName || null,
    apiKey: apiKey ? `${apiKey.slice(0, 4)}...` : null,
    verified: Boolean(lastVerification?.ok),
});

module.exports = {
    cloudinary,
    verifyCloudinaryConfig,
    getCloudinaryStatus,
    isConfigured,
};
