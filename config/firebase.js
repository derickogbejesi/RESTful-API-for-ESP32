const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'iot-gateway-8ec36-firebase-adminsdk-fbsvc-613f092efd.json');
const serviceAccount = require(serviceAccountPath);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://iot-gateway-8ec36-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

const db = admin.database();

module.exports = { admin, db };