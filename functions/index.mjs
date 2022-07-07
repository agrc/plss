import admin from 'firebase-admin';

admin.initializeApp();

export { addPoint, getMyPoints } from './points.mjs';
export { createFirestoreUser } from './userCreation.mjs';
