import { initializeApp, type AppOptions } from 'firebase-admin/app';

export const safelyInitializeApp = (): AppOptions => {
  let options: AppOptions = {};

  try {
    options = JSON.parse(process.env.FIREBASE_CONFIG ?? '{}') as AppOptions;
  } catch (error) {
    console.error('This happens in unit tests', error);
  }

  if (['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
    options.storageBucket = 'localhost';
    options.projectId = 'ut-dts-agrc-plss-dev';
  }

  try {
    initializeApp(options);
    // eslint-disable-next-line no-empty
  } catch {}

  return options;
};