import { logger, https } from 'firebase-functions/v2';
import {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore';
import {
  onObjectFinalized,
  onObjectDeleted,
} from 'firebase-functions/v2/storage';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { defineSecret } from 'firebase-functions/params';
import { safelyInitializeApp } from './firebase.js';

const cors = [
  /localhost/,
  /ut-dts-agrc-plss-dev\.web\.app$/,
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
const sharedDriveId = defineSecret('SHARED_DRIVE_ID');

// Firebase authentication
export const onCreateUser = beforeUserCreated(async (event) => {
  logger.debug('[auth::user::onCreate] importing createUser');
  const createUser = (await import('./auth/onCreate.js')).createUser;

  const result = await createUser(event.data);

  logger.debug('[auth::user::onCreate]', result);

  return result;
});

// Firestore triggers
export const onCancelSubmission = onDocumentUpdated(
  {
    document: '/submissions/{docId}',
    secrets: [sendGridApiKey],
  },
  async (event) => {
    const after = event.data.after.data();
    const current = after.status.user.cancelled;
    const before = event.data.before.data();
    const previous = before.status.user.cancelled;

    logger.debug(
      '[database::submissions::onCancel] trigger: submission document updated',
      { id: event.params.docId },
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
      { previous, current },
    );

    logger.debug(
      '[database::submissions::onCancel] importing cancelSubmission',
    );
    const cancelSubmission = (
      await import('./database/submissions/onCancelSubmission.js')
    ).cancelSubmission;

    const apiSnippet = (sendGridApiKey.value() ?? 'null').slice(0, 4);

    logger.debug('runWith', { apiSnippet });

    const result = await cancelSubmission(event.data.before);

    logger.debug('[database::submissions::onCancel]', result);

    return result;
  },
);

export const onCreateAddLocation = onDocumentCreated(
  '/submissions/{docId}',
  async (event) => {
    const record = event.data.data();

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
      { blmId: record.blm_point_id },
    );

    const result = await createAddLocation(
      event.params.docId,
      record.blm_point_id,
    );

    logger.debug('[database::submissions::onCreateAddLocation]', result);

    return result;
  },
);

export const onCreateMonumentRecord = onDocumentCreated(
  {
    document: '/submissions/{docId}',
    memory: '512MiB',
    secrets: [sharedDriveId],
  },
  async (event) => {
    const record = event.data.data();

    logger.debug(
      '[database::submissions::onCreateMonumentRecord] trigger: new submission for',
      { document: event.params.docId, type: record.type },
    );

    logger.debug(
      '[database::submissions::onCreateMonumentRecord] importing createMonumentRecord',
    );
    const createMonumentRecord = (
      await import('./database/submissions/onCreateMonument.js')
    ).createMonumentRecord;

    const result = await createMonumentRecord(
      record,
      event.params.docId,
      sharedDriveId.value(),
    );

    logger.debug('[database::submissions::onCreateMonumentRecord]', result);

    return result;
  },
);

export const onCleanUpPointAttachments = onDocumentDeleted(
  '/submitters/{userId}/points/{docId}',
  async (event) => {
    const record = event.data.data();

    logger.debug(
      '[database::submitters::onCleanUpPointAttachments] trigger: point deleted',
      { event, record },
    );

    if ((record.photos?.length ?? 0) < 1) {
      logger.debug(
        '[database::submitters::onCleanUpPointAttachments] skipping photo clean up. reason: empty',
      );

      return true;
    }

    logger.info(
      '[database::submitters::onCleanUpPointAttachments] deleting reference point blobs',
      {
        photos: record.photos,
      },
    );

    logger.debug(
      '[database::submissions::onCleanUpPointAttachments] importing cleanUpPointAttachments',
    );
    const cleanUpPointAttachments = (
      await import('./database/submissions/onDelete.js')
    ).cleanUpPointAttachments;

    const result = await cleanUpPointAttachments(record.photos);

    logger.debug('[database::submissions::onCleanUpPointAttachments]', {
      result,
    });

    return result;
  },
);

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
  { cors, memory: '512MiB' },
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
export const onCreateNotify = onObjectFinalized(
  {
    secrets: [sendGridApiKey],
    bucket: config.storageBucket,
  },
  async (event) => {
    const { name, contentType, bucket: fileBucket } = event.data;

    logger.debug(
      '[storage::finalize::onCreateNotify] trigger: storage object created',
      {
        name,
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

    logger.debug('runWith', { apiSnippet });

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
  },
);

export const syncProfileImage = onObjectDeleted(
  { bucket: config.storageBucket },
  async (event) => {
    const { name } = event.data;

    logger.debug(
      '[storage::onDelete::syncProfileImage] trigger: storage object deleted',
      {
        name,
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
  },
);
