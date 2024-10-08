import CornerSubmission from './CornerSubmission.jsx';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import { getAnalytics } from 'firebase/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FunctionsProvider,
  StorageProvider,
} from 'reactfire';

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
  title: 'Corner/Submission',
  component: CornerSubmission,
  decorators: [
    (Story) => {
      const app = initializeApp(config);
      const storage = getStorage(app);
      const functions = getFunctions(app);
      const auth = getAuth(app);

      return (
        <QueryClientProvider client={new QueryClient()}>
          <FirebaseAppProvider firebaseConfig={config}>
            <AuthProvider sdk={auth}>
              <FunctionsProvider sdk={functions}>
                <StorageProvider sdk={storage}>
                  <AnalyticsProvider sdk={getAnalytics(app)}>
                    <SubmissionProvider
                      context={{
                        section: 1,
                        corner: 'NW',
                        status: 'new',
                        collected: '2022-01-01',
                        accuracy: 'surveyor',
                        description: 'test',
                        notes: 'notes',
                      }}
                    >
                      {Story()}
                    </SubmissionProvider>
                  </AnalyticsProvider>
                </StorageProvider>
              </FunctionsProvider>
            </AuthProvider>
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
  const data = {
    ...args,
    submission: { blmPointId: 'UT260060S0020E0_240400', type: 'new' },
  };

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '450px', maxWidth: '450px' }}
    >
      <CornerSubmission {...data} />
    </div>
  );
};

export const CornerSubmissionStory = Template.bind({});
