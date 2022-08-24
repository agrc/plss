import { error as logError } from 'firebase-functions/logger';
import { auth } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const onCreate = auth.user().onCreate(async (user) => {
  info('creating user', user, { structuredData: true });

  const data = {
    email: user.email,
    displayName: user.displayName,
    created_at: new Date(),
  };

  try {
    await getFirestore().collection('submitters').doc(user.uid).set(data);
  } catch (error) {
    logError('error creating user', error, user, {
      structuredData: true,
    });
  }

  info('created user', { structuredData: true });

  return true;
});

export default onCreate;
