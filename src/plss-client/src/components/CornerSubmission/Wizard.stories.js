import Wizard from './Wizard';

const story = {
  title: 'Form Items/Wizard',
  component: Wizard,
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

const Template = (args) => <Wizard {...args} />;

export const Beginning = Template.bind({});
Beginning.args = {
  clear: true,
  next: true,
};

export const Middle = Template.bind({});
Middle.args = {
  back: () => {},
  clear: true,
  next: true,
};

export const End = Template.bind({});
End.args = {
  back: () => {},
  finish: () => {},
};
