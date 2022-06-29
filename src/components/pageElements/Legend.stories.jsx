import Legend from './Legend.jsx';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Page Elements/Legend',
  component: Legend,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Legend {...args} />;

export const Primary = Template.bind({});
