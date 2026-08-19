const fs = require('fs');
const path = require('path');
const _dirName = typeof __dirname !== 'undefined' ? __dirname : (process.cwd() || '/');

/**
 * Railway/cloud: paste service account JSON into GOOGLE_CREDENTIALS_JSON.
 * Local dev: use GOOGLE_APPLICATION_CREDENTIALS pointing at a file.
 */
let isPrepared = false;

function prepareGoogleCredentials() {
  if (isPrepared) {
    return;
  }

  if (process.env.VERCEL || process.env.CLOUDFLARE || typeof __dirname === 'undefined') {
    // Serverless environments with read-only filesystems
    // Rely on environment variables directly instead of the file
    isPrepared = true;
    return;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    isPrepared = true;
    return;
  }

  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!raw) {
    return;
  }

  const configDir = path.join(_dirName, '..', 'config');
  const credPath = path.join(configDir, 'google-credentials.json');
  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(credPath, raw, { encoding: 'utf8', mode: 0o600 });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
  } catch (err) {
    console.error('Failed to write Google credentials:', err.message);
  } finally {
    isPrepared = true;
  }
}

module.exports = { prepareGoogleCredentials };
