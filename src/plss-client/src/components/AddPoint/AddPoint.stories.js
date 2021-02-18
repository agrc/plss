import { useImmerReducer } from 'use-immer';
import reduce, { defaults } from '../../AppReducer';
import './../../index.css';
import AddPoint from './AddPoint';

const story = {
  title: 'Drawer/AddPoint',
  component: AddPoint,
  argTypes: {
    publish: { action: 'action' },
  },
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

const Template = (args) => {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  console.log(state);
  const data = { ...state.addPoint, ...args };
  console.log(data);
  return (
    <div className="text-white">
      <AddPoint
        dispatch={(action) => {
          dispatch(action);
          args.publish(action);
        }}
        {...data}
      />
    </div>
  );
};

export const Default = Template.bind({});

export const Active = Template.bind({});
Active.args = {
  active: true,
};

export const PointSet = Template.bind({});
PointSet.args = {
  point: { x: 100.123456, y: -112.234234 },
};
