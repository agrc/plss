import { initializeApp } from 'firebase-admin/app';

const setupFirebase = () => {
  let app = {};
  try {
    app = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (error) {
    console.error('This happens in unit tests', error);
  }

  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    app.storageBucket = 'localhost';
    app.projectId = 'ut-dts-agrc-plss-dev';
  }

  try {
    initializeApp(app);
    // eslint-disable-next-line no-empty
  } catch {}

  return app;
};

export default setupFirebase;
