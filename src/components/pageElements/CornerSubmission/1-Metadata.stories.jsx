import { createStore, StateMachineProvider } from 'little-state-machine';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Metadata from './Metadata.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Metadata,
  decorators: [
    (Story) => (
      <StateMachineProvider>
        <MemoryRouter initialEntries={['/submission/1']}>
          <Routes>
            <Route path="/submission/:id" element={<Story />} />
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
      },
    },
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
