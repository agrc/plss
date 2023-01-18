import { initializeApp } from 'firebase-admin/app';

const setupFirebase = () => {
  let app = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APPID,
  };

  if (
    'FIREBASE_CONFIG' in process.env &&
    process.env.NODE_ENV === 'production'
  ) {
    app = JSON.parse(process.env.FIREBASE_CONFIG);
  }

  try {
    initializeApp(app);
    // eslint-disable-next-line no-empty
  } catch {}

  return app;
};

export default setupFirebase;
