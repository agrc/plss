import {
  auth,
  logger,
  firestore,
  runWith,
  storage,
} from 'firebase-functions/v1'; // v2 does not support auth triggers as of july/23
import { https } from 'firebase-functions/v2';
import { safelyInitializeApp } from './firebase.js';
import { defineSecret } from 'firebase-functions/params';

const cors = [
  /localhost/,
  /ut-dts-agrc-web-api-dev-self-service\.web\.app$/,
  /plss\.(?:dev\.)?utah\.gov/,
];

const throwIfAnonymous = (auth) => {
  if (!auth) {
    logger.debug('No auth context');

    throw new https.HttpsError('unauthenticated', 'You must log in');
  }
};

const throwIfNoFormData = (data) => {
  if (!data) {
    logger.debug('No data provided');

    throw new https.HttpsError('invalid-argument', 'No data provided');
  }
};

const config = safelyInitializeApp();
const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

// Firebase authentication
export const onCreateUser = auth.user().onCreate(async (user) => {
  logger.debug('[auth::user::onCreate] importing createUser');
  const createUser = (await import('./auth/onCreate.js')).createUser;

  const result = await createUser(user);

  logger.debug('[auth::user::onCreate]', result);

  return result;
});

// Firestore triggers
export const onCancelSubmission = runWith({ secrets: [sendGridApiKey] })
  .firestore.document('/submissions/{docId}')
  .onUpdate(async (change, context) => {
    const current = change.after.get('status.user.cancelled');
    const previous = change.before.get('status.user.cancelled');

    logger.debug(
      '[database::submissions::onCancel] trigger: submission document updated',
      context.params.docId,
      {
        structuredData: true,
      },
    );

    if (current === null) {
      logger.debug(
        '[database::submissions::onCancel] skipping cancellation email. reason: not cancelled',
      );

      return;
    }

    if (current === previous) {
      logger.debug(
        '[database::submissions::onCancel] skipping cancellation email. reason: status did not change',
      );

      return;
    }

    logger.debug(
      '[database::submissions::onCancel] cancelled before and after',
      previous,
      current,
      {
        structuredData: true,
      },
    );

    logger.debug(
      '[database::submissions::onCancel] importing cancelSubmission',
    );
    const cancelSubmission = (
      await import('./database/submissions/onCancelSubmission.js')
    ).cancelSubmission;

    const apiSnippet = (process.env.SENDGRID_API_KEY ?? 'null').slice(0, 4);

    logger.debug('runWith', apiSnippet, {
      structuredData: true,
    });

    const result = await cancelSubmission(change.before);

    logger.debug('[database::submissions::onCancel]', result);

    return result;
  });

export const onCreateAddLocation = firestore
  .document('/submissions/{docId}')
  .onCreate(async (snap, context) => {
    const record = snap.data();

    if (record.type === 'new') {
      logger.debug(
        '[database::submissions::onCreateAddLocation] skipping location update. reason: new submission',
      );

      return;
    }

    if (record.location) {
      logger.debug(
        '[database::submissions::onCreateAddLocation] skipping location update. reason: existing submission with coordinates',
      );

      return;
    }

    logger.debug(
      '[database::submissions::onCreateAddLocation] importing createAddLocation',
    );
    const createAddLocation = (
      await import('./database/submissions/onCreateAddLocation.js')
    ).createAddLocation;

    logger.info(
      '[database::submissions::onCreateAddLocation] getting location for submission',
      record.blm_point_id,
      {
        structuredData: true,
      },
    );

    const result = await createAddLocation(
      context.params.docId,
      record.blm_point_id,
    );

    logger.debug('[database::submissions::onCreateAddLocation]', result);

    return result;
  });

export const onCreateMonumentRecord = runWith({ memory: '512MB' })
  .firestore.document('/submissions/{docId}')
  .onCreate(async (snap, context) => {
    const record = snap.data();

    logger.debug(
      '[database::submissions::onCreateMonumentRecord] trigger: new submission for',
      context.params.docId,
      record.type,
      {
        structuredData: true,
      },
    );

    logger.debug(
      '[database::submissions::onCreateMonumentRecord] importing createMonumentRecord',
    );
    const createMonumentRecord = (
      await import('./database/submissions/onCreateMonument.js')
    ).createMonumentRecord;

    const result = await createMonumentRecord(record, context.params.docId);

    logger.debug('[database::submissions::onCreateMonumentRecord]', result);

    return result;
  });

export const onCleanUpPointAttachments = firestore
  .document('/submitters/{userId}/points/{docId}')
  .onDelete(async (snap, context) => {
    const record = snap.data();

    logger.debug(
      '[database::submitters::onCleanUpPointAttachments] trigger: point deleted',
      context,
      record,
      {
        structuredData: true,
      },
    );

    if ((record.photos?.length ?? 0) < 1) {
      logger.debug(
        '[database::submitters::onCleanUpPointAttachments] skipping photo clean up. reason: empty',
      );

      return true;
    }

    logger.info(
      '[database::submitters::onCleanUpPointAttachments] deleting reference point blobs',
      record.photos,
      {
        structuredData: true,
      },
    );

    logger.debug(
      '[database::submissions::onCleanUpPointAttachments] importing cleanUpPointAttachments',
    );
    const cleanUpPointAttachments = (
      await import('./database/submissions/onDelete.js')
    ).cleanUpPointAttachments;

    const result = await cleanUpPointAttachments(record.photos);

    logger.debug('[database::submissions::onCleanUpPointAttachments]', result);

    return result;
  });

// HTTPS triggers
export const getMyContent = https.onCall({ cors }, async (request) => {
  logger.debug('[https::getMyContent] starting');

  throwIfAnonymous(request);

  logger.debug('[https::getMyContent] importing body');
  const myContent = (await import('./https/getMyContent.js')).myContent;

  const result = await myContent(request.auth.uid);

  logger.debug('[https::getMyContent]', {
    submissions: result.submissions?.length,
    points: result.points?.length,
  });

  return result;
});

export const getProfile = https.onCall({ cors }, async (request) => {
  logger.debug('[https::getMyProfile] starting');

  throwIfAnonymous(request);

  logger.debug('[https::getMyProfile] importing body');
  const myProfile = (await import('./https/getMyProfile.js')).myProfile;

  const result = await myProfile(request.auth);

  return result;
});

export const postCancelCorner = https.onCall(
  { cors },
  async ({ data, auth }) => {
    logger.debug('[https::postCancelCorner] starting');

    throwIfAnonymous(auth);
    throwIfNoFormData(data);

    logger.debug('[https::postCancelCorner] importing body');
    const cancelCorner = (await import('./https/postCancelCorner.js'))
      .cancelCorner;

    const result = await cancelCorner(data, auth.uid);

    return result;
  },
);

export const postCorner = https.onCall({ cors }, async ({ data, auth }) => {
  logger.debug('[https::postCorner] starting');

  throwIfAnonymous(auth);
  throwIfNoFormData(data);

  logger.debug('[https::postCorner] importing body');
  const saveCorner = (await import('./https/postCorner.js')).saveCorner;

  const result = await saveCorner(data, auth);

  return result;
});

export const postGeneratePreview = https.onCall(
  { cors, memory: '512MB' },
  async ({ data, auth }) => {
    logger.debug('[https::postGeneratePreview] starting');

    throwIfAnonymous(auth);
    throwIfNoFormData(data);

    logger.debug('[https::postGeneratePreview] importing body');
    const generatePreview = (await import('./https/postGeneratePreview.js'))
      .generatePreview;

    const result = await generatePreview(data, auth);

    return result;
  },
);

export const postPoint = https.onCall(async ({ data, auth }) => {
  logger.debug('[https::postPoint] starting');

  throwIfAnonymous(auth);
  throwIfNoFormData(data);

  logger.debug('[https::postPoint] importing body');
  const savePoint = (await import('./https/postPoint.js')).savePoint;

  const result = await savePoint(data, auth);

  return result;
});

export const postProfile = https.onCall(async ({ data, auth }) => {
  logger.debug('[https::postProfile] starting');

  throwIfAnonymous(auth);
  throwIfNoFormData(data);

  logger.debug('[https::postProfile] importing body');
  const updateProfile = (await import('./https/postProfile.js')).updateProfile;

  const result = await updateProfile(data, auth.uid);

  return result;
});

// Storage triggers
export const onCreateNotify = runWith({ secrets: [sendGridApiKey] })
  .storage.bucket(config.storageBucket)
  .object()
  .onFinalize(async (object) => {
    const { name, contentType, bucket: fileBucket } = object;

    logger.debug(
      '[storage::finalize::onCreateNotify] trigger: storage object created',
      name,
      {
        structuredData: true,
      },
    );

    const match =
      /under-review\/(?<pointId>.+)\/(?<userId>.+)\/(?<documentId>.*)\.pdf$/i.exec(
        name,
      );

    if (!match) {
      logger.debug(
        'storage::finalize::onCreateNotify] skipping creation notify. reason: not a final pdf',
      );

      return;
    }

    const apiSnippet = (process.env.SENDGRID_API_KEY ?? 'null').slice(0, 4);

    logger.debug('runWith', apiSnippet, {
      structuredData: true,
    });

    logger.debug('[storage::finalize::onCreateNotify] importing body');
    const createNotify = (await import('./storage/onCreateNotify.js'))
      .createNotify;

    const result = await createNotify(
      name,
      match.groups,
      fileBucket,
      contentType,
    );

    logger.debug('[storage::finalize::onCreateNotify]', result);

    return result;
  });

export const syncProfileImage = storage
  .bucket(config.storageBucket)
  .object()
  .onDelete(async (object) => {
    const { name } = object;

    logger.debug(
      '[storage::onDelete::syncProfileImage] trigger: storage object deleted',
      name,
      {
        structuredData: true,
      },
    );

    const match = /submitters\/(?<uid>.+)\/profile\/seal\.(png|jpe?g)$/i.exec(
      name,
    );

    if (!match) {
      logger.debug(
        '[storage::onDelete::syncProfileImage] skipping deletion. reason: not a seal',
      );

      return;
    }

    logger.debug(
      '[storage::onDelete::syncProfileImage] importing syncProfileImage',
    );
    const syncProfileImage = (await import('./storage/onDelete.js'))
      .syncProfileImage;

    const result = await syncProfileImage(match.groups.uid);

    logger.debug('[storage::onDelete::syncProfileImage]', result);

    return result;
  });
