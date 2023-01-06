import GroupButton from './GroupButton.jsx';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map Elements/GroupButton',
  component: GroupButton,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <GroupButton
    view={{
      when: (x) => x(),
      ui: { add: () => {}, remove: () => {} },
    }}
    width={640}
    {...args}
  />
);

export const Primary = Template.bind({});
