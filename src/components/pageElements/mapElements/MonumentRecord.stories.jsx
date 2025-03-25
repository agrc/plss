import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirebaseAnalyticsProvider, FirebaseAppProvider, FirebaseStorageProvider } from '@ugrc/utah-design-system';
import MonumentRecord from './MonumentRecord.jsx';

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
            <FirebaseAnalyticsProvider>
              <FirebaseStorageProvider>{Story()}</FirebaseStorageProvider>
            </FirebaseAnalyticsProvider>
          </FirebaseAppProvider>
        </QueryClientProvider>
      );
    },
  ],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <MonumentRecord dispatch={() => {}} {...args} />;

export const Primary = Template.bind({});
