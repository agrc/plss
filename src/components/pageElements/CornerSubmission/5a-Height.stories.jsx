import { createStore, StateMachineProvider } from 'little-state-machine';
import { BrowserRouter } from 'react-router-dom';
import { GeographicHeight } from './Coordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: GeographicHeight,
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
      <GeographicHeight {...data} />
    </div>
  );
};

export const StepFiveGeographicHeight = Template.bind({});
StepFiveGeographicHeight.args = {
  system: 'wgs84',
};
