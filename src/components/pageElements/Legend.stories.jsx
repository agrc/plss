import { FirebaseAnalyticsProvider, FirebaseAppProvider } from '@ugrc/utah-design-system';
import Legend from './Legend.jsx';

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
  title: 'Page Elements/Legend',
  component: Legend,
  decorators: [
    (Story) => (
      <FirebaseAppProvider config={config}>
        <FirebaseAnalyticsProvider>
          <Story />
        </FirebaseAnalyticsProvider>
      </FirebaseAppProvider>
    ),
  ],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Legend {...args} />;

export const Primary = Template.bind({});
