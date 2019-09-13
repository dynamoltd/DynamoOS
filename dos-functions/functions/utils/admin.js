const admin = require('firebase-admin');
const serviceAccount = require('../keys/default-service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://dynamo-os-1.firebaseio.com`
});

//admin.initializeApp();
const db = admin.firestore();

module.exports = { admin, db };
