import { Select } from '.';

const story = {
  title: 'Form Items/Select',
  component: Select,
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

const Template = (args) => <Select {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  name: 'input',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'input',
};

export const Options = Template.bind({});
Options.args = {
  placeholder: 'place holder',
  options: ['1', '2', '3'],
  name: 'input',
};

export const LabelValue = Template.bind({});
LabelValue.args = {
  placeholder: 'place holder',
  options: [
    { label: '1', value: 'one' },
    { label: '2', value: 'two' },
    { label: '3', value: 'three' },
  ],
  name: 'input',
};
