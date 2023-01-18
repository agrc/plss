import { initializeApp } from 'firebase-admin/app';

const setupFirebase = () => {
  const app = JSON.parse(process.env.FIREBASE_CONFIG);

  if (process.env.NODE_ENV === 'local') {
    app.storageBucket = 'localhost';
  }

  try {
    initializeApp(app);
    // eslint-disable-next-line no-empty
  } catch {}

  return app;
};

export default setupFirebase;
