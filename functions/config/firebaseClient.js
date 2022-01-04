const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: 'washyourbottle.firebaseapp.com',
  projectId: 'washyourbottle',
  storageBucket: 'washyourbottle.appspot.com',
  messagingSenderId: '909732167291',
  appId: '1:909732167291:web:120f96c9b25579b8b12cde',
  measurementId: 'G-HV1G7CZS96',
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

module.exports = { firebaseApp, firebaseAuth, firebaseConfig };
