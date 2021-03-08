import CornerSubmission from './CornerSubmission';

const story = {
  title: 'Corner/Submission',
  component: CornerSubmission,
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

  return (
    <div className="relative h-screen overflow-y-auto text-white" style={{ width: '320px', maxWidth: '320px' }}>
      <CornerSubmission {...data} />
    </div>
  );
};

export const Default = Template.bind({});
