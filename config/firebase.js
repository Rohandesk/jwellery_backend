const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const initFirebase = () => {
  try {
    // Candidates to check for service account json
    const possiblePaths = [];

    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      possiblePaths.push(path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
      possiblePaths.push(path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
      possiblePaths.push(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    }

    // Default fallbacks in config/
    possiblePaths.push(path.join(__dirname, 'firebase-service-account.json'));
    possiblePaths.push(path.join(__dirname, 'serviceAccountKey.json'));

    const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));

    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      console.log(`[Firebase Admin] Initialized successfully using: ${path.basename(serviceAccountPath)} (Project: ${serviceAccount.project_id || 'N/A'})`);
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase service account is required in production');
      }
      console.warn('[Firebase Admin] Service account file not found. Running in mock/development mode.');
    }
  } catch (error) {
    console.error('[Firebase Admin Error]', error.message);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

module.exports = { initFirebase, admin };
