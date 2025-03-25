import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import Images from './Images.jsx';

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
  component: Images,
  decorators: [
    (Story) => (
      <FirebaseAppProvider config={config}>
        <FirebaseStorageProvider>
          <FirebaseAuthProvider>
            <FirebaseAnalyticsProvider>
              <SubmissionProvider>{Story()}</SubmissionProvider>
            </FirebaseAnalyticsProvider>
          </FirebaseAuthProvider>
        </FirebaseStorageProvider>
      </FirebaseAppProvider>
    ),
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
    <div className="relative h-screen overflow-y-auto text-white" style={{ width: '450px', maxWidth: '450px' }}>
      <Images {...data} />
    </div>
  );
};

export const Step4Photos = Template.bind({});
