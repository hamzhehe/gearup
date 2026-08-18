const fs = require('fs');
const path = require('path');

/**
 * Railway/cloud: paste service account JSON into GOOGLE_CREDENTIALS_JSON.
 * Local dev: use GOOGLE_APPLICATION_CREDENTIALS pointing at a file.
 */
function prepareGoogleCredentials() {
  if (process.env.VERCEL) {
    // Vercel Serverless Functions have a read-only filesystem (except /tmp)
    // We expect Dialogflow to rely on environment variables directly instead of the file
    return;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }

  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!raw) {
    return;
  }

  const configDir = path.join(__dirname, '..', 'config');
  const credPath = path.join(configDir, 'google-credentials.json');
  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(credPath, raw, { encoding: 'utf8', mode: 0o600 });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
  } catch (err) {
    console.error('Failed to write Google credentials:', err.message);
  }
}

module.exports = { prepareGoogleCredentials };
