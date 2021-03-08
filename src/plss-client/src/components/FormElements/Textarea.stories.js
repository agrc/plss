import { Textarea } from '.';

const story = {
  title: 'Form Items/Textarea',
  component: Textarea,
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

const Template = (args) => <Textarea {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'textarea',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'textarea',
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  value: 'default value',
  name: 'textarea',
};

export const Rows = Template.bind({});
Rows.args = {
  name: 'textarea',
  rows: 10,
};

export const MaxLength = Template.bind({});
MaxLength.args = {
  name: 'textarea',
  value: 'ten charac',
  limit: 10,
};
