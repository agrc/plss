import functions from 'firebase-functions';
import admin from 'firebase-admin';

export const createFirestoreUser = functions.auth
  .user()
  .onCreate(async (user) => {
    functions.logger.info('creating user', user, { structuredData: true });

    const data = {
      email: user.email,
      displayName: user.displayName,
      created_at: new Date(),
    };

    try {
      await admin.firestore().collection('submitters').doc(user.uid).set(data);
    } catch (error) {
      functions.logger.error('error creating user', error, user, {
        structuredData: true,
      });
    }

    functions.logger.info('created user', { structuredData: true });

    return true;
  });
