import { LimitedTextarea } from './LimitedTextarea.jsx';

export default {
  title: 'Form Elements/LimitedTextarea',
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

const Template = (args) => <LimitedTextarea {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'textarea',
  maxLength: 100,
  field: {},
  errors: {},
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'place holder',
  name: 'textarea',
  maxLength: 100,
  field: {},
  errors: {},
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  value: 'default value',
  name: 'textarea',
  maxLength: 100,
  field: { value: 'default value' },
  errors: {},
};

export const Rows = Template.bind({});
Rows.args = {
  name: 'textarea',
  rows: 10,
  maxLength: 100,
  field: {},
  errors: {},
};

export const MaxLength = Template.bind({});
MaxLength.args = {
  name: 'textarea',
  value: 'ten charac',
  maxLength: 10,
  field: { value: 'ten charac' },
  errors: {},
};
