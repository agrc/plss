import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import Pdf from './Pdf.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Pdf,
  decorators: [
    (Story) => <SubmissionProvider context={{ blmPointId: 1, type: 'existing' }}>{Story()}</SubmissionProvider>,
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

const Template = (args) => {
  const data = { ...args };

  return (
    <FirebaseAppProvider config={config}>
      <FirebaseStorageProvider>
        <FirebaseAuthProvider>
          <FirebaseAnalyticsProvider>
            <div className="relative h-screen overflow-y-auto text-white" style={{ width: '450px', maxWidth: '450px' }}>
              <Pdf {...data} />
            </div>
          </FirebaseAnalyticsProvider>
        </FirebaseAuthProvider>
      </FirebaseStorageProvider>
    </FirebaseAppProvider>
  );
};

export const Step1BUploadPdf = Template.bind({});
