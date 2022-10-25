import { StorageProvider, FirebaseAppProvider, AuthProvider } from 'reactfire';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Images from './Images.jsx';

const story = {
  title: 'Corner/Submission/Parts',
  component: Images,
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
};

export default story;

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

export const Step6Photos = Template.bind({});
