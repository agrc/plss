import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import { Longitude } from './GeographicCoordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Longitude,
  decorators: [
    (Story) => (
      <SubmissionProvider context={{ blmPointId: 1, type: 'new', datum: 'geographic-nad83' }}>
        {Story()}
      </SubmissionProvider>
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
    xstate: {
      submission: {
        events: { type: 'start submission' },
      },
    },
    xstateInspectOptions: {
      url: 'https://stately.ai/viz?inspect',
      serialize: null,
    },
  },
};

const Template = (args) => {
  const data = { ...args };

  return (
    <div className="relative h-screen overflow-y-auto text-white" style={{ width: '450px', maxWidth: '450px' }}>
      <Longitude {...data} />
    </div>
  );
};

export const Step3BLongitude = Template.bind({});
