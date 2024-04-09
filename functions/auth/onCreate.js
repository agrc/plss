import { logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const createUser = async (user) => {
  logger.info('[auth::user::onCreate] creating user', user, {
    structuredData: true,
  });

  const data = {
    email: user.email,
    displayName: user.displayName,
    created_at: new Date(),
  };

  try {
    await db.collection('submitters').doc(user.uid).set(data);
  } catch (error) {
    logger.error('[auth::user::onCreate] error creating user', error, user, {
      structuredData: true,
    });
  }

  logger.info('[auth::user::onCreate] created user', { structuredData: true });

  return true;
};
