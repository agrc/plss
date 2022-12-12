import { StorageProvider, FirebaseAppProvider, AuthProvider } from 'reactfire';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Images from './Images.jsx';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Images,
  decorators: [
    (Story) => (
      <SubmissionProvider>
        <Story />
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

const Template = (args) => {
  const data = { ...args };
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
  const auth = getAuth(app);

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <StorageProvider sdk={storage}>
        <AuthProvider sdk={auth}>
          <div
            className="relative h-screen overflow-y-auto text-white"
            style={{ width: '450px', maxWidth: '450px' }}
          >
            <Images {...data} />
          </div>
        </AuthProvider>
      </StorageProvider>
    </FirebaseAppProvider>
  );
};

export const Step4Photos = Template.bind({});
