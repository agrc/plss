import { Select } from './Select.jsx';

export default {
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

const Template = (args) => <Select {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  name: 'input',
  inputRef: () => {
    return {
      onChange: () => {},
    };
  },
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'input',
  inputRef: () => {
    return {
      onChange: () => {},
    };
  },
};

export const Options = Template.bind({});
Options.args = {
  placeholder: 'place holder',
  options: ['1', '2', '3'],
  name: 'input',
  inputRef: () => {
    return {
      onChange: () => {},
    };
  },
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
  inputRef: () => {
    return {
      onChange: () => {},
    };
  },
};
