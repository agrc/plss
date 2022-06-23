import { Input } from './Inputs.jsx';

export default {
  title: 'Form Items/Input',
  component: Input,
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

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'input',
  inputRef: () => {},
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'input',
  inputRef: () => {},
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  value: 'default value',
  name: 'input',
  inputRef: () => {},
};
