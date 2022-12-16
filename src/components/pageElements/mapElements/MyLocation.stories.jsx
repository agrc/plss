import { GpsButton } from './MyLocation.jsx';

export default {
  component: GpsButton,
  title: 'Map Elements/MyLocation',
};

const Template = () => {
  const node = { ui: { add: () => {} } };

  return (
    <div className="text-white" style={{ width: '320px' }}>
      <GpsButton
        fwdRef={node}
        send={() => {}}
        state={{ matches: (value) => value === 'gps.idle' }}
      />
      <GpsButton
        fwdRef={node}
        send={() => {}}
        state={{ matches: (value) => value === 'gps.pending' }}
      />
      <GpsButton
        fwdRef={node}
        send={() => {}}
        state={{ matches: (value) => value === 'resolved' }}
      />
      <GpsButton
        fwdRef={node}
        send={() => {}}
        state={{ matches: (value) => value === 'rejected' }}
      />
      <GpsButton
        fwdRef={node}
        send={() => {}}
        state={{ matches: (value) => value === 'notSupported' }}
      />
    </div>
  );
};

export const Default = Template.bind({});
