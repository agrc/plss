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
import { useImmerReducer } from 'use-immer';
import reduce, { defaults } from '../reducers/AppReducer';
import './../../index.css';
import AddPoint from './AddPoint.jsx';

export default {
  title: 'Drawer/AddPoint',
  component: AddPoint,
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
        <QueryClientProvider client={new QueryClient()}>
          <FirebaseAppProvider firebaseConfig={config}>
            <AuthProvider sdk={auth}>
              <FunctionsProvider sdk={functions}>
                <StorageProvider sdk={storage}>{Story()}</StorageProvider>
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
          value: '#4B5563',
        },
      ],
    },
  },
};

const Template = (args) => {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  const data = { ...state.addPoint, ...args };

  return (
    <div className="text-white" style={{ width: '320px' }}>
      <AddPoint
        dispatch={(action) => {
          dispatch(action);
          args.publish(action);
        }}
        {...data}
      />
    </div>
  );
};

export const Default = Template.bind({});

export const Active = Template.bind({});
Active.args = {
  active: true,
};

export const PointSet = Template.bind({});
PointSet.args = {
  point: { x: 100.123456, y: -112.234234 },
};

export const Notes = Template.bind({});
Notes.args = {
  notes: 'i really like this area where i put the point.',
};

export const Images = Template.bind({});
Images.args = {
  photos: ['some photo', 'another photo'],
};
