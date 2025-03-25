import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseFunctionsProvider,
  FirebaseStorageProvider,
} from '@ugrc/utah-design-system';
import { useImmerReducer } from 'use-immer';
import reduce, { defaults } from '../reducers/AppReducer';
import './../../index.css';
import AddPoint from './AddPoint.jsx';

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
  title: 'Drawer/AddPoint',
  component: AddPoint,
  argTypes: {
    publish: { action: 'action' },
  },
  decorators: [
    (Story) => {
      return (
        <QueryClientProvider client={new QueryClient()}>
          <FirebaseAppProvider config={config}>
            <FirebaseAuthProvider>
              <FirebaseFunctionsProvider>
                <FirebaseAnalyticsProvider>
                  <FirebaseStorageProvider>{Story()}</FirebaseStorageProvider>
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
