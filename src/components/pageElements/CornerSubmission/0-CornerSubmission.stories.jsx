import CornerSubmission from './CornerSubmission.jsx';
import { SubmissionProvider } from '../../contexts/SubmissionContext.jsx';

const story = {
  title: 'Corner/Submission',
  component: CornerSubmission,
  decorators: [
    (Story) => (
      <SubmissionProvider>
        <Story />
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

export default story;

const Template = (args) => {
  const data = {
    ...args,
    submission: { blmPointId: 'UT260060S0020E0_240400', type: 'new' },
  };

  return (
    <div
      className="relative h-screen overflow-y-auto text-white"
      style={{ width: '450px', maxWidth: '450px' }}
    >
      <CornerSubmission {...data} />
    </div>
  );
};

export const CornerSubmissionStory = Template.bind({});
