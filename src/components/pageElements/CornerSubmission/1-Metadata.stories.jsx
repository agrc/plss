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
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import Metadata from './Metadata.jsx';

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
  title: 'Corner/Submission/Parts',
  component: Metadata,
  decorators: [
    (Story) => {
      const app = initializeApp(config);
      const storage = getStorage(app);
      const functions = getFunctions(app);
      const auth = getAuth(app);

      return (
        <QueryClientProvider client={new QueryClient()}>
          <FirebaseAppProvider config={config}>
            <FirebaseAuthProvider sdk={auth}>
              <FirebaseFunctionsProvider sdk={functions}>
                <FirebaseStorageProvider sdk={storage}>
                  <FirebaseAnalyticsProvider>
                    <SubmissionProvider context={{ blmPointId: 1, type: 'new' }}>{Story()}</SubmissionProvider>
                  </FirebaseAnalyticsProvider>
                </FirebaseStorageProvider>
              </FirebaseFunctionsProvider>
            </FirebaseAuthProvider>
          </FirebaseAppProvider>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    backgrounds: {
      default: 'drawer',
      values: [
        {
          name: 'drawer',
          value: '#4B5563',
        },
      ],
    },
    xstate: {
      submission: {
        events: { type: 'start submission' },
      },
    },
    xstateInspectOptions: {
      url: 'https://stately.ai/viz?inspect',
      serialize: null,
    },
  },
};

const Template = (args) => {
  const data = { ...args };
  return (
    <div className="relative h-screen overflow-y-auto" style={{ width: '450px', maxWidth: '450px' }}>
      <Metadata {...data} />
    </div>
  );
};

export const Step1Metadata = Template.bind({});
