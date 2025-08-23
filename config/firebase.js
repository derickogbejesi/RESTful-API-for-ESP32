const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp;

const initializeFirebase = () => {
  if (!firebaseApp) {
    const serviceAccountPath = path.join(__dirname, 'iot-gateway-8ec36-firebase-adminsdk-fbsvc-613f092efd.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://iot-gateway-8ec36-default-rtdb.firebaseio.com'
      });
    } else {
      console.error('Firebase service account file not found. Please ensure the credentials file is in the config directory.');
      console.error('Expected path:', serviceAccountPath);
      process.exit(1);
    }
  }
  return firebaseApp;
};

const getDatabase = () => {
  const app = initializeFirebase();
  return admin.database();
};

module.exports = { 
  admin, 
  db: getDatabase(),
  initializeFirebase 
};