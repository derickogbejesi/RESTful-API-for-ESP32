require('dotenv').config();
const { db } = require('./config/firebase');

async function testFirebase() {
  console.log('Testing Firebase connection...\n');
  
  try {
    // Test write
    console.log('1. Testing write operation...');
    const testRef = await db.ref('test').push({
      message: 'Test connection',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Write successful:', testRef.key);
    
    // Test read
    console.log('\n2. Testing read operation...');
    const snapshot = await db.ref('test').once('value');
    const data = snapshot.val();
    console.log('✓ Read successful:', data);
    
    // Clean up test data
    await db.ref('test').remove();
    console.log('\n✓ Firebase connection is working!');
    
  } catch (error) {
    console.error('\n✗ Firebase test failed!');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check Firebase Realtime Database rules in Firebase Console');
    console.error('2. Ensure rules allow read/write for testing:');
    console.error('   {');
    console.error('     "rules": {');
    console.error('       ".read": true,');
    console.error('       ".write": true');
    console.error('     }');
    console.error('   }');
    console.error('3. Check if the database URL is correct');
    console.error('4. Verify service account has proper permissions');
  }
  
  process.exit(0);
}

testFirebase();