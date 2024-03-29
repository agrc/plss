import Wizard from './Wizard.jsx';

export default {
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

const Template = (args) => <Wizard {...args} />;

export const Beginning = Template.bind({});
Beginning.args = {
  clear: true,
  next: true,
  back: false,
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
