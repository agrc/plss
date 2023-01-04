import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import {
  AuthProvider,
  FirebaseAppProvider,
  FunctionsProvider,
  StorageProvider,
} from 'reactfire';
import './../../index.css';
import MyContent from './MyContent.jsx';

export default {
  title: 'Drawer/MyContent',
  component: MyContent,
  argTypes: {
    publish: { action: 'action' },
  },
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
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: {
                  retry: false,
                },
              },
            })
          }
        >
          <FirebaseAppProvider firebaseConfig={config}>
            <AuthProvider sdk={auth}>
              <FunctionsProvider sdk={functions}>
                <StorageProvider sdk={storage}>
                  <Story />
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
          value: '#F8FAFC',
        },
      ],
    },
  },
};

const Template = (args) => {
  return (
    <div className="text-sky-900" style={{ width: '450px' }}>
      <MyContent {...args} />
    </div>
  );
};

export const MyContentSelector = Template.bind({});
