import { GpsButton } from './MyLocation.jsx';

export default {
  component: GpsButton,
  title: 'Map Elements/MyLocation',
};

const Template = () => {
  const node = { ui: { add: () => {} } };

  return (
    <div className="flex gap-2 text-white" style={{ width: '320px' }}>
      <GpsButton fwdRef={node} send={() => {}} state={{ matches: (value) => value === 'idle' }} />
      <GpsButton fwdRef={node} send={() => {}} state={{ matches: (value) => value === 'tracking.requesting' }} />
      <GpsButton fwdRef={node} send={() => {}} state={{ matches: (value) => value === 'tracking.active' }} />
      <GpsButton fwdRef={node} send={() => {}} state={{ matches: (value) => value === 'error' }} />
      <GpsButton fwdRef={node} send={() => {}} state={{ matches: (value) => value === 'notSupported' }} />
    </div>
  );
};

export const Default = Template.bind({});
