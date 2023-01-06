import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';
import CoordinatePicker from './Datum.jsx';

export default {
  title: 'Corner/Submission/Parts',
  component: CoordinatePicker,
  decorators: [
    (Story) => (
      <SubmissionProvider context={{ blmPointId: 1, type: 'new' }}>
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
        events: [{ type: 'start submission' }, { type: 'NEXT' }],
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
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '450px', maxWidth: '450px' }}
    >
      <CoordinatePicker {...data} />
    </div>
  );
};

export const Step2CoordinateType = Template.bind({});
