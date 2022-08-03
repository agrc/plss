import { createStore, StateMachineProvider } from 'little-state-machine';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GeographicHeight } from './Coordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: GeographicHeight,
  decorators: [
    (Story) => (
      <StateMachineProvider>
        <MemoryRouter
          initialEntries={['/submission/1/coordinates/geographic/nad83/height']}
        >
          <Routes>
            <Route
              path="/submission/:id/coordinates/geographic/:system/height"
              element={<Story />}
            />
          </Routes>
        </MemoryRouter>
      </StateMachineProvider>
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
    name: 'submissions',
    submissions: {
      1: {
        blmPointId: 1,
        notes: 'hi there',
        status: 'existing',
        accuracy: 'survey',
        northing: { seconds: 24, minutes: 24, degrees: 37 },
        easting: { seconds: 12, minutes: 12, degrees: 112 },
        datum: 'geographic-nad83',
      },
    },
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
