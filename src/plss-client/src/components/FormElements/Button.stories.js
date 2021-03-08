import { Button } from '.';

const story = {
  title: 'Form Items/Button',
  component: Button,
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

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  label: 'button',
  name: 'my-button',
  type: 'button',
  primary: true,
};

export const ButtonGroupItemLeft = Template.bind({});
ButtonGroupItemLeft.args = {
  label: 'button',
  name: 'my-button',
  type: 'button',
  primary: true,
  buttonGroup: {
    left: true,
  },
};

export const ButtonGroupItemCenter = Template.bind({});
ButtonGroupItemCenter.args = {
  label: 'button',
  name: 'my-button',
  type: 'button',
  primary: true,
  buttonGroup: {
    center: true,
  },
};

export const ButtonGroupItemRight = Template.bind({});
ButtonGroupItemRight.args = {
  label: 'button',
  name: 'my-button',
  type: 'button',
  primary: true,
  buttonGroup: {
    right: true,
  },
};
