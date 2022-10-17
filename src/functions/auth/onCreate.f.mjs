import { auth, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';

const onCreate = auth.user().onCreate(async (user) => {
  logger.info('creating user', user, { structuredData: true });

  const data = {
    email: user.email,
    displayName: user.displayName,
    created_at: new Date(),
  };

  try {
    await getFirestore().collection('submitters').doc(user.uid).set(data);
  } catch (error) {
    logger.error('error creating user', error, user, {
      structuredData: true,
    });
  }

  logger.info('created user', { structuredData: true });

  return true;
});

export default onCreate;
