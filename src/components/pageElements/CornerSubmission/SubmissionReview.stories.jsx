import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseFunctionsProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import Review from './SubmissionReview.jsx';

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
  component: Review,
  decorators: [
    (Story) => {
      return (
        <aside className="drawer z-10 flex max-w-screen flex-col overflow-scroll rounded-t-2xl bg-slate-50 px-4 py-4 text-sky-900 shadow-2xl sm:rounded-t-none md:pb-12">
          <QueryClientProvider client={new QueryClient()}>
            <FirebaseAppProvider config={config}>
              <FirebaseFunctionsProvider>
                <FirebaseAnalyticsProvider>
                  <FirebaseStorageProvider>{Story()}</FirebaseStorageProvider>
                </FirebaseAnalyticsProvider>
              </FirebaseFunctionsProvider>
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
        closeUp: '',
        extra1: '',
        extra2: '',
        extra3: '',
        extra4: '',
        extra5: '',
        extra6: '',
        extra7: '',
        extra8: '',
        extra9: '',
        extra10: '',
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
