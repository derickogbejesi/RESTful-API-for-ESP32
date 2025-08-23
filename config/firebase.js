const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./iot-gateway-8ec36-firebase-adminsdk-fbsvc-613f092efd.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://iot-gateway-8ec36-default-rtdb.firebaseio.com'
});

const db = admin.database();

module.exports = { admin, db };