import { LimitedTextarea } from '.';

const story = {
  title: 'Form Items/LimitedTextarea',
  component: LimitedTextarea,
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

const Template = (args) => <LimitedTextarea {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'textarea',
  limit: 100,
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'textarea',
  limit: 100,
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  value: 'default value',
  name: 'textarea',
  limit: 100,
};

export const Rows = Template.bind({});
Rows.args = {
  name: 'textarea',
  rows: 10,
  limit: 100,
};

export const MaxLength = Template.bind({});
MaxLength.args = {
  name: 'textarea',
  value: 'ten charac',
  limit: 10,
};
