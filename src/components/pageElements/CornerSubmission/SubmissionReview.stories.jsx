import Review from './SubmissionReview.jsx';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import {
  FirebaseAppProvider,
  FunctionsProvider,
  StorageProvider,
} from 'reactfire';
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default {
  title: 'Corner/Submission/Parts',
  component: Review,
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
      const functions = getFunctions(app);
      const storage = getStorage(app);

      return (
        <aside className="drawer max-w-screen z-10 flex flex-col overflow-scroll rounded-t-2xl bg-slate-50 px-4 py-4 text-sky-900 shadow-2xl sm:rounded-t-none md:pb-12 ">
          <QueryClientProvider client={new QueryClient()}>
            <FirebaseAppProvider firebaseConfig={config}>
              <FunctionsProvider sdk={functions}>
                <StorageProvider sdk={storage}>
                  <Story />
                </StorageProvider>
              </FunctionsProvider>
            </FirebaseAppProvider>
          </QueryClientProvider>
        </aside>
      );
    },
  ],
};

const ExistingTemplate = (args) => (
  <SubmissionProvider
    context={{
      blmPointId: 'point_1',
      type: 'existing',
      existing: {
        pdf: 'submitters/user1/existing/point_1/existing-sheet.pdf',
      },
      datum: 'geographic-nad83',
      geographic: {
        northing: { seconds: 10, minutes: 14, degrees: 41 },
        easting: { seconds: 29, minutes: 14, degrees: 111 },
        unit: 'm',
        elevation: 3200,
      },
      grid: {
        zone: 'north',
        unit: 'm',
        easting: 521679.496,
        northing: 1100285.503,
        verticalDatum: '',
        elevation: null,
      },
    }}
  >
    <Review {...args} />
  </SubmissionProvider>
);
const NewTemplate = (args) => (
  <SubmissionProvider
    context={{
      blmPointId: 'UT260060S0050W0_300640',
      type: 'new',
      metadata: {
        corner: 'NW',
        section: 1,
        mrrc: true,
        notes: 'Some general notes',
        description: 'A monument description',
        accuracy: 'survey',
        status: 'existing',
      },
      datum: 'grid-nad83',
      grid: {
        verticalDatum: 'NAVD88',
        elevation: 2500,
        unit: 'm',
        easting: 471992.726,
        northing: 1155931.4,
        zone: 'north',
      },
      geographic: {
        northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
        easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
        unit: 'ft',
        elevation: 4500,
      },
      images: {
        map: '',
        monument: '',
        'close-up': '',
        'extra-1': '',
        'extra-2': '',
        'extra-3': '',
        'extra-4': '',
        'extra-5': '',
        'extra-6': '',
        'extra-7': '',
        'extra-8': '',
        'extra-9': '',
        'extra-10': '',
        'extra-0': null,
      },
    }}
  >
    <Review {...args} />
  </SubmissionProvider>
);

export const ReviewNew = NewTemplate.bind({});
ReviewNew.args = {};

export const ReviewExisting = ExistingTemplate.bind({});
ReviewExisting.args = {};
