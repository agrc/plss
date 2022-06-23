import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { createStore, StateMachineProvider } from 'little-state-machine';
import { Outlet } from 'react-router-dom';
import extractTownshipInformation from './blmPointId';
import clsx from 'clsx';
// import Metadata from './Metadata.jsx';

// const Metadata = lazy(() => import('./Metadata.jsx'));
// const CoordinatePicker = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({
//     default: module.CoordinatePicker,
//   }))
// );
// const GeographicHeight = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({
//     default: module.GeographicHeight,
//   }))
// );
// const GridCoordinates = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({
//     default: module.GridCoordinates,
//   }))
// );
// const Latitude = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({ default: module.Latitude }))
// );
// const Longitude = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({ default: module.Longitude }))
// );
// const Review = lazy(() =>
//   import('./Coordinates.jsx').then((module) => ({ default: module.Review }))
// );

export const updateAction = (state, payload) => {
  return {
    ...state,
    newSheet: {
      ...state.newSheet,
      ...payload,
    },
  };
};

export default function CornerSubmission() {
  const [hide, setHide] = useState(false);
  const pointId = 'UT260110S0030E0_460700';
  createStore(
    {
      newSheet: {
        blmPointId: pointId,
      },
    },
    {
      name: 'newSheetSubmission',
      middleWares: [
        (store) => {
          console.log(store);
          return store;
        },
      ],
    }
  );

  const user = {
    name: 'Test Person',
    license: 1123123,
  };

  const townshipInformation = extractTownshipInformation(pointId);
  const location = {
    county: 'Beaver',
    meridian: townshipInformation.meridian.abbr,
    township: townshipInformation.township,
    range: townshipInformation.range,
  };

  const Icon = !hide ? MinusCircleIcon : PlusCircleIcon;

  return (
    <StateMachineProvider>
      <div className="relative text-indigo-200 opacity-60">
        <Icon
          className={clsx('h-6 w-6', {
            'absolute -right-2 -top-2': !hide,
          })}
          onClick={() => setHide(!hide)}
        />
      </div>
      {!hide && (
        <p className="mb-4 rounded-lg bg-slate-800 p-3 text-justify text-xs leading-tight text-indigo-300">
          This monument record information will be reviewed by the county
          surveyor under stewardship of this corner to satisfy the requirements
          of state code 17-23-17-7a.
        </p>
      )}
      {!hide && (
        <div className="inline-grid w-full text-xs">
          <div className="flex justify-between">
            <span className="font-semibold">Submitted By</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Surveyor License</span>
            <span>{user.license}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">BLM Point #</span>
            <span>{pointId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">County</span>
            <span>{location.county}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Township</span>
            <span>
              {location.meridian}T{location.township}R{location.range}
            </span>
          </div>
          <span className="mx-auto my-4 inline-block h-1 w-2/3 rounded bg-slate-500"></span>
        </div>
      )}
      <div className="mb-2 overflow-y-auto pb-16">
        <Outlet />
      </div>
    </StateMachineProvider>
  );
}
