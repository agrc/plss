import Identify from './Identify.jsx';
import { AuthProvider, FirebaseAppProvider, StorageProvider } from 'reactfire';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Page Elements/Identify',
  component: Identify,
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
      const auth = getAuth(app);

      return (
        <aside className="drawer max-w-screen z-10 flex flex-col overflow-scroll rounded-t-2xl border border-indigo-700 bg-slate-600 px-4 py-4 text-white shadow-2xl sm:rounded-t-none md:pb-12 ">
          <QueryClientProvider client={new QueryClient()}>
            <FirebaseAppProvider firebaseConfig={config}>
              <AuthProvider sdk={auth}>
                <StorageProvider sdk={storage}>
                  <Story />
                </StorageProvider>
              </AuthProvider>
            </FirebaseAppProvider>
          </QueryClientProvider>
        </aside>
      );
    },
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
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Identify {...args} />;

export const Authenticated = Template.bind({});
Authenticated.args = {
  authenticated: true,
  graphic: {
    attributes: {
      point_id: 'UT260060S0020E0_240400',
    },
  },
  dispatch: () => {},
};

export const Unauthenticated = Template.bind({});
Unauthenticated.args = {
  authenticated: false,
  graphic: {
    attributes: {
      point_id: 'UT260060S0020E0_240400',
    },
  },
  dispatch: () => {},
};

export const Empty = Template.bind({});
Empty.args = {
  authenticated: false,
  graphic: null,
  dispatch: () => {},
};
