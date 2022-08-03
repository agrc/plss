import { createStore, StateMachineProvider } from 'little-state-machine';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Latitude } from './Coordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Latitude,
  decorators: [
    (Story) => (
      <StateMachineProvider>
        <MemoryRouter
          initialEntries={[
            '/submission/1/coordinates/geographic/nad83/northing',
          ]}
        >
          <Routes>
            <Route
              path="/submission/:id/coordinates/geographic/:system/northing"
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
        datum: 'geographic-nad83',
      },
    },
  });

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '320px', maxWidth: '320px' }}
    >
      <Latitude {...data} />
    </div>
  );
};

export const StepThreeGeographicNorthing = Template.bind({});
