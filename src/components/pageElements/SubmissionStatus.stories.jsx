import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseFunctionsProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getStatus } from '../../../functions/shared/index.js';
import { Submissions } from './Submissions.jsx';

let config = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  config = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

export default {
  title: 'Drawer/MyContent/SubmissionStatus',
  component: Submissions,
  argTypes: {
    publish: { action: 'action' },
  },
  decorators: [
    (Story) => {
      const app = initializeApp(config);
      const storage = getStorage(app);
      const functions = getFunctions(app);
      const auth = getAuth(app);

      return (
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: {
                  retry: false,
                },
              },
            })
          }
        >
          <FirebaseAppProvider config={config}>
            <FirebaseAuthProvider sdk={auth}>
              <FirebaseFunctionsProvider sdk={functions}>
                <FirebaseAnalyticsProvider>
                  <FirebaseStorageProvider sdk={storage}>{Story()}</FirebaseStorageProvider>
                </FirebaseAnalyticsProvider>
              </FirebaseFunctionsProvider>
            </FirebaseAuthProvider>
          </FirebaseAppProvider>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {},
};

export const Empty = {
  args: {
    items: [],
    dispatch: () => {},
  },
};

const createMockItem = (statusValues = {}) => {
  const status = getStatus(statusValues);

  return {
    label: status.label,
    submitted: new Date('2024-01-15'),
    id: 'UT260060S0020E0_240400',
    status: status,
    geometry: '',
    attributes: '',
  };
};

export const InitialSubmission = {
  args: {
    items: [
      createMockItem({
        published: false,
        ugrc: {
          approved: null,
          comments: null,
          reviewedAt: null,
          reviewedBy: null,
        },
        county: {
          approved: null,
          comments: null,
          reviewedAt: null,
          reviewedBy: null,
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const UGRCApproved = {
  args: {
    items: [
      createMockItem({
        published: false,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: null,
        },
        county: {
          approved: null,
          comments: null,
          reviewedAt: null,
          reviewedBy: null,
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const UGRCRejected = {
  args: {
    items: [
      createMockItem({
        published: false,
        ugrc: {
          approved: false,
          comments: 'ugrc comment',
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
        },
        county: {
          approved: null,
          comments: null,
          reviewedAt: null,
          reviewedBy: null,
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const CountyApproved = {
  args: {
    items: [
      createMockItem({
        published: false,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'auto approved',
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const CountyRejected = {
  args: {
    items: [
      createMockItem({
        published: false,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: null,
        },
        county: {
          approved: false,
          comments: 'county comment',
          reviewedAt: new Date(),
          reviewedBy: null,
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const MonumentSheetPublished = {
  args: {
    items: [
      createMockItem({
        published: true,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'auto approved',
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};

export const BLMDataLoaded = {
  args: {
    items: [
      createMockItem({
        published: true,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'auto approved',
        },
        sgid: {
          approved: true,
        },
        user: {
          cancelled: null,
        },
      }),
    ],
    dispatch: () => {},
  },
};
