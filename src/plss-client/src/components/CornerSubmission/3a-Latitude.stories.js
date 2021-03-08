import { createMemoryHistory } from 'history';
import { createStore, StateMachineProvider } from 'little-state-machine';
import { Route, Router } from 'react-router-dom';
import { Latitude } from './Coordinates';

const story = {
  title: 'Corner/Submission/Parts',
  component: Latitude,
  decorators: [
    (story) => (
      <Router history={createMemoryHistory({ initialEntries: ['/submission/new'] })}>
        <StateMachineProvider>
          <Route path="/submission/new" component={() => story()} />
        </StateMachineProvider>
      </Router>
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

export default story;

const Template = (args) => {
  const data = { ...args };
  createStore({
    newSheet: {},
  });

  return (
    <div className="relative h-screen overflow-y-auto text-white" style={{ width: '320px', maxWidth: '320px' }}>
      <Latitude {...data} />
    </div>
  );
};

export const StepThreeGeographicNorthing = Template.bind({});
