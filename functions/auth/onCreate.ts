import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import type { AuthUserRecord } from 'firebase-functions/v2/identity';

const db = getFirestore();

export const createUser = async (user: AuthUserRecord): Promise<true> => {
  logger.info('[auth::user::onCreate] creating user', { user });

  const data = {
    email: user.email,
    displayName: user.displayName,
    created_at: new Date(),
    tenant: user.tenantId ?? 'default',
    elevated: false,
  };

  try {
    await db.collection('submitters').doc(user.uid).set(data);
  } catch (error) {
    logger.error('[auth::user::onCreate] error creating user', { error, user });
  }

  logger.info('[auth::user::onCreate] created user');

  return true;
};
