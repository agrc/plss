import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseFunctionsProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import './../../index.css';
import MyContent from './MyContent.jsx';

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
  title: 'Drawer/MyContent',
  component: MyContent,
  argTypes: {
    publish: { action: 'action' },
  },
  decorators: [
    (Story) => {
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
          <FirebaseAppProvider config={config}>
            <FirebaseAuthProvider sdk={auth}>
              <FirebaseFunctionsProvider sdk={functions}>
                <FirebaseAnalyticsProvider>
                  <FirebaseStorageProvider sdk={storage}>{Story()}</FirebaseStorageProvider>
                </FirebaseAnalyticsProvider>
              </FirebaseFunctionsProvider>
            </FirebaseAuthProvider>
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
