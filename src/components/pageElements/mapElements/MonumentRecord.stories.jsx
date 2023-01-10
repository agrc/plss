import MonumentRecord from './MonumentRecord.jsx';
import { FirebaseAppProvider, StorageProvider } from 'reactfire';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map Elements/Monument Record Finder',
  component: MonumentRecord,
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
            <StorageProvider sdk={storage}>{Story()}</StorageProvider>
          </FirebaseAppProvider>
        </QueryClientProvider>
      );
    },
  ],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <MonumentRecord dispatch={() => {}} {...args} />;

export const Primary = Template.bind({});
