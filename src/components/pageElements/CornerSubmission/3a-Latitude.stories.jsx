import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import { Latitude } from './GeographicCoordinates.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: Latitude,
  decorators: [
    (Story) => (
      <SubmissionProvider
        context={{
          blmPointId: 'UT260060S0020E0_240400',
          type: 'new',
          datum: 'grid-nad83',
          grid: {
            zone: 'north',
            unit: 'm',
            northing: 1155931.412,
            easting: 471992.726,
          },
        }}
      >
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
        events: [{ type: 'start submission' }, { type: 'NEXT' }, { type: 'NEXT' }, { type: 'NEXT' }],
      },
      project: {
        events: { type: 'SET_COORDINATES' },
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
      <Latitude {...data} />
    </div>
  );
};

export const Step3ALatitude = Template.bind({});
