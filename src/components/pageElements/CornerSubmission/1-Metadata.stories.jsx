import { createStore, StateMachineProvider } from 'little-state-machine';
import { BrowserRouter } from 'react-router-dom';
import Metadata from './Metadata.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Metadata,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <StateMachineProvider>
          <Story />
        </StateMachineProvider>
      </BrowserRouter>
    ),
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
  const data = { ...args };
  createStore({
    newSheet: {},
  });

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '320px', maxWidth: '320px' }}
    >
      <Metadata {...data} />
    </div>
  );
};

export const StepOneMetadata = Template.bind({});
