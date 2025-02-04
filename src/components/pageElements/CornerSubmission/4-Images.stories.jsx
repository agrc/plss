import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { AuthProvider, FirebaseAppProvider, StorageProvider } from 'reactfire';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import Images from './Images.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Images,
  decorators: [(Story) => <SubmissionProvider>{Story()}</SubmissionProvider>],
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
          <div className="relative h-screen overflow-y-auto text-white" style={{ width: '450px', maxWidth: '450px' }}>
            <Images {...data} />
          </div>
        </AuthProvider>
      </StorageProvider>
    </FirebaseAppProvider>
  );
};

export const Step4Photos = Template.bind({});
