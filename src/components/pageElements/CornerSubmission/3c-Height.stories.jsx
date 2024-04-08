import { GeographicHeight } from './GeographicCoordinates.jsx';
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

export default {
  title: 'Corner/Submission/Parts',
  component: GeographicHeight,
  decorators: [
    (Story) => {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APPID,
      };
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
                        blmPointId: 1,
                        type: 'new',
                        geographic: {
                          unit: 'm',
                        },
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
};

const Template = (args) => {
  const data = { ...args };

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '450px', maxWidth: '450px' }}
    >
      <GeographicHeight {...data} />
    </div>
  );
};

export const Step3CGeographicHeight = Template.bind({});
Step3CGeographicHeight.args = {
  system: 'wgs84',
};
