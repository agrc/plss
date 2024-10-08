import MonumentRecord from './MonumentRecord.jsx';
import { FirebaseAppProvider, StorageProvider } from 'reactfire';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map Elements/Monument Record Finder',
  component: MonumentRecord,
  decorators: [
    (Story) => {
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
