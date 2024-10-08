import { StorageProvider, FirebaseAppProvider, AuthProvider } from 'reactfire';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Pdf from './Pdf.jsx';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Pdf,
  decorators: [
    (Story) => (
      <SubmissionProvider context={{ blmPointId: 1, type: 'existing' }}>
        {Story()}
      </SubmissionProvider>
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
  const app = initializeApp(config);
  const storage = getStorage(app);
  const auth = getAuth(app);

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <StorageProvider sdk={storage}>
        <AuthProvider sdk={auth}>
          <div
            className="relative h-screen overflow-y-auto text-white"
            style={{ width: '450px', maxWidth: '450px' }}
          >
            <Pdf {...data} />
          </div>
        </AuthProvider>
      </StorageProvider>
    </FirebaseAppProvider>
  );
};

export const Step1BUploadPdf = Template.bind({});
