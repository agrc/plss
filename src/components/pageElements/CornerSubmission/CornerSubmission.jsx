import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { createStore, StateMachineProvider } from 'little-state-machine';
import { Outlet, useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import extractTownshipInformation from './blmPointId';
import clsx from 'clsx';

export const updateAction = (state, payload) => {
  const newState = { ...state };
  newState.submissions[payload.blmPointId] = {
    ...newState.submissions[payload.blmPointId],
    ...payload,
  };

  return newState;
};
export const getStateForId = (state, id) =>
  id in (state?.submissions ?? {}) ? state.submissions[id] : {};
export const getStateValue = (state, id, property) => {
  const data = getStateForId(state, id);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return '';
  }

  let section;
  let subProperty = property;
  if (property.indexOf('.') > -1) {
    [section, subProperty] = property.split('.');
  }

  if (!(property in data) && !(section in data)) {
    return '';
  }

  return data[property] ?? data[section][subProperty];
};

function ErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <p>{error.message}</p>
    </div>
  );
}
ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
};

export default function CornerSubmission() {
  const [hide, setHide] = useState(false);
  const { id } = useParams();

  const pointId = id;
  const submissions = {};
  submissions[pointId] = {};

  createStore(
    {
      submissions: submissions,
    },
    {
      name: 'submissions',
      middleWares: [
        (store) => {
          console.log(store);
          return store;
        },
      ],
      storageType: window.localStorage,
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
      <div className="mb-2 flex-1 overflow-y-auto pb-2">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </StateMachineProvider>
  );
}
