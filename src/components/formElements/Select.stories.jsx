import { Select } from './Select.jsx';

export default {
  title: 'Form Elements/Select',
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

const Template = (args) => <Select {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  name: 'input',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'this is a place holder',
  name: 'input',
  options: [],
  currentValue: null,
  onChange: () => {},
};

export const Options = Template.bind({});
Options.args = {
  placeholder: 'options as primitives',
  options: ['1', '2', '3'],
  name: 'input',
  currentValue: null,
  onChange: () => {},
};

export const LabelValue = Template.bind({});
LabelValue.args = {
  placeholder: 'options as objects',
  options: [
    { label: '1', value: 'one' },
    { label: '2', value: 'two' },
    { label: '3', value: 'three' },
  ],
  name: 'input',
  currentValue: null,
  onChange: () => {},
};

export const SelectedItem = Template.bind({});
const options = [
  { label: '1', value: 'one' },
  { label: '2', value: 'two' },
  { label: '3', value: 'three' },
];
SelectedItem.args = {
  placeholder: 'place holder should not be used',
  options,
  name: 'input',
  currentValue: options[2],
  onChange: () => {},
};
