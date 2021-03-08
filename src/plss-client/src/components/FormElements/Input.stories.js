import { Input } from '.';

const story = {
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

export default story;

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'input',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'input',
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  defaultValue: 'default value',
  name: 'input',
};
