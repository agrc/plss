import Township from './Township.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map Elements/Township',
  component: Township,
  argTypes: {
    publish: { action: 'action' },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        {Story()}
        <ReactQueryDevtools />
      </QueryClientProvider>
    ),
  ],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Township
    apiKey="AGRC-Dev"
    dispatch={(action) => {
      console.log(action);
      args.publish(action);
    }}
    {...args}
  />
);

export const Primary = Template.bind({});
