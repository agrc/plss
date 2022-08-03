import { createStore, StateMachineProvider } from 'little-state-machine';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Longitude } from './Coordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Longitude,
  decorators: [
    (Story) => (
      <StateMachineProvider>
        <MemoryRouter
          initialEntries={[
            '/submission/1/coordinates/geographic/nad83/easting',
          ]}
        >
          <Routes>
            <Route
              path="/submission/:id/coordinates/geographic/:system/easting"
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
        datum: 'geographic-nad83',
      },
    },
  });

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '320px', maxWidth: '320px' }}
    >
      <Longitude {...data} />
    </div>
  );
};

export const StepFourGeographicEasting = Template.bind({});
