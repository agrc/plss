import { Switch } from './Switch.jsx';

export default {
  title: 'Form Elements/Switch',
  component: Switch,
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

const Template = (args) => (
  <>
    <label htmlFor="switch" className="font-semibold text-white">
      A label
    </label>
    <Switch {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  name: 'switch',
};

export const Unchecked = Template.bind({});
Unchecked.args = {
  currentValue: false,
  name: 'switch',
};

export const Checked = Template.bind({});
Checked.args = {
  currentValue: true,
  name: 'switch',
};

export const ScreenReader = Template.bind({});
ScreenReader.args = {
  screenReader: 'Use this to do that',
  name: 'switch',
};
