import { getStorage } from 'firebase-admin/storage';
import { safelyInitializeApp } from '../../firebase.js';

const config = safelyInitializeApp();
const bucket = getStorage().bucket(config.storageBucket);

export const cleanUpPointAttachments = async (
  photos: readonly string[],
): Promise<true> => {
  for (const photo of photos) {
    await bucket.file(photo).delete();
  }

  return true;
};