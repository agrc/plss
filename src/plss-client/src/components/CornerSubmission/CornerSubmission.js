import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createStore, StateMachineProvider } from 'little-state-machine';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { CoordinatePicker, GeographicHeight, GridCoordinates, Latitude, Longitude, Review } from './Coordinates';
import Metadata from './Metadata';

export const updateAction = (state, payload) => {
  return {
    ...state,
    newSheet: {
      ...state.newSheet,
      ...payload,
    },
  };
};

const CornerSubmission = () => {
  const [hide, setHide] = React.useState(false);
  createStore({
    newSheet: {},
  });

  const user = {
    name: 'Test Person',
    license: 1123123,
  };

  const location = {
    county: 'Beaver',
    meridian: 'SL',
    township: '29S',
    range: '6W',
    section: 16,
    corner: 'SE',
  };

  const pointId = 'UT260020S0080E0_500420';

  return (
    <StateMachineProvider>
      <div className="absolute text-indigo-200 opacity-60 top-2 right-2">
        <FontAwesomeIcon
          icon={!hide ? faMinusSquare : faPlusSquare}
          fixedWidth
          size="1x"
          pull="right"
          onClick={() => setHide(!hide)}
        />
      </div>
      {!hide && (
        <p className="p-3 mb-4 text-xs leading-tight text-justify text-indigo-300 bg-gray-800 rounded-lg">
          This monument record information will be reviewed by the county surveyor under stewardship of this corner to
          satisfy the requirements of state code 17-23-17-7a.
        </p>
      )}
      <Router basename="/submission">
        {!hide && (
          <div className="inline-grid w-full text-xs">
            <div className="flex justify-between">
              <label className="font-semibold">Submitted By</label>
              <span>{user.name}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">Surveyor License</label>
              <span>{user.license}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">BLM Point #</label>
              <span>{pointId}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">County</label>
              <span>{location.county}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">TRSC</label>
              <span>
                {location.meridian}T{location.township}R{location.range} {location.section} {location.corner}
              </span>
            </div>
            <span className="inline-block w-2/3 h-1 mx-auto my-4 bg-gray-500 rounded"></span>
          </div>
        )}
        <div className="pb-16 mb-2 overflow-y-auto">
          <Route exact path="/:id" component={Metadata} />
          <Route exact path="/:id/coordinates" component={CoordinatePicker} />
          <Route exact path="/:id/coordinates/geographic/:system/northing" component={Latitude} />
          <Route exact path="/:id/coordinates/geographic/:system/easting" component={Longitude} />
          <Route exact path="/:id/coordinates/geographic/:system/height" component={GeographicHeight} />
          <Route exact path="/:id/coordinates/grid/:system" component={GridCoordinates} />
          <Route exact path="/:id/review" component={Review} />
        </div>
      </Router>
    </StateMachineProvider>
  );
};

export default CornerSubmission;
