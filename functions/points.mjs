import functions from 'firebase-functions';
import admin from 'firebase-admin';
import { contrastColor } from 'contrast-color';

export const addPoint = functions.https.onCall((data, context) => {
  if (!context.auth) {
    functions.logger.warn('unauthenticated request', { structuredData: true });

    return {
      error: {
        status: 'Not allowed',
        message: 'You must log in',
      },
    };
  }

  data.created_at = new Date();
  functions.logger.info('creating point', data, context.auth.uid, {
    structuredData: true,
  });

  try {
    admin
      .firestore()
      .collection('submitters')
      .doc(context.auth.uid)
      .collection('points')
      .add(data);
  } catch (error) {
    functions.logger.error('error adding point', error, context.auth, {
      structuredData: true,
    });

    return {
      error: {
        status: 'error',
        message: 'The point was not saved',
      },
    };
  }

  return 'ok';
});

const graphicConverter = {
  toFirestore(data) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);

    return {
      geometry: {
        type: 'point',
        x: data.location.x,
        y: data.location.y,
        spatialReference: {
          wkid: 3857,
        },
      },
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: data.color,
        size: '8px',
        outline: {
          color: contrastColor.call({}, { bgColor: data.color }),
          width: 1,
        },
      },
      attributes: {
        name: data.name,
        notes: data.notes,
        when: data.created_at.toDate().toISOString(),
        id: snapshot.id,
      },
    };
  },
};

export const getMyPoints = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    functions.logger.warn('unauthenticated request', { structuredData: true });

    return {
      error: {
        status: 'Not allowed',
        message: 'You must log in',
      },
    };
  }

  const points = [];

  try {
    const snapshot = await admin
      .firestore()
      .collection('submitters')
      .doc(context.auth.uid)
      .collection('points')
      .withConverter(graphicConverter)
      .get();

    snapshot.forEach((doc) => {
      points.push(doc.data());
    });
  } catch (error) {
    return {
      error: {
        status: 'error',
        message: 'The points could not be retrieved',
      },
    };
  }

  return points;
});
