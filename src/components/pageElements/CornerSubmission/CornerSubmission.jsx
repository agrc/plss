/* eslint-disable no-unused-vars */
import { lazy, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { createStore, StateMachineProvider } from 'little-state-machine';
import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';
import extractTownshipInformation from './blmPointId.mjs';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';

const MonumentPdf = lazy(() => import('./Pdf.jsx'));
const Metadata = lazy(() => import('./Metadata.jsx'));
const CoordinatePicker = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.CoordinatePicker,
  }))
);
const GeographicHeight = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.GeographicHeight,
  }))
);
const GridCoordinates = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.GridCoordinates,
  }))
);
const Latitude = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.Latitude,
  }))
);
const Longitude = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.Longitude,
  }))
);
const Images = lazy(() => import('./Images.jsx'));
const Review = lazy(() =>
  import('./Coordinates.jsx').then((module) => ({
    default: module.Review,
  }))
);

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

  if (property.indexOf('.') > -1) {
    const [section, subProperty] = property.split('.');

    if (!(section in data) || data[section] === null) {
      return '';
    }

    return data[section][subProperty] ?? '';
  }

  if (!(property in data)) {
    return '';
  }

  return data[property] ?? '';
};

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <p>{error.message}</p>
      <button
        onClick={() => {
          resetErrorBoundary();
        }}
      >
        Try again
      </button>
    </div>
  );
}
ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default function CornerSubmission({ submission, dispatch }) {
  const [hide, setHide] = useState(false);
  const [state, send] = useContext(SubmissionContext);
  const pointId = submission.blmPointId;
  const submissions = {};
  submissions[pointId] = {};

  console.log('current context', state.context);

  useEffect(() => {
    send('start submission');
  }, [submission.type, send]);

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

  const getFormPart = (state) => {
    switch (true) {
      case state.matches('uploading existing pdf'):
        return <MonumentPdf />;
      case state.matches('adding metadata'):
        return <Metadata />;
      case state.matches('choosing datum'):
        return <CoordinatePicker />;
      case state.matches('entering latitude'):
        return <Latitude />;
      case state.matches('entering longitude'):
        return <Longitude />;
      case state.matches('entering ellipsoid height'):
        return <GeographicHeight />;
      case state.matches('entering grid coordinates'):
        return <GridCoordinates />;
      case state.matches('uploading photos'):
        return <Images />;
      case state.matches('reviewing'):
        return <Review />;
      default:
        return <div>No matching component for {state.value} state</div>;
    }
  };

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
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}
        >
          {getFormPart(state)}
        </ErrorBoundary>
      </div>
    </StateMachineProvider>
  );
}
CornerSubmission.propTypes = {
  submission: PropTypes.shape({
    blmPointId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }),
  dispatch: PropTypes.func.isRequired,
};
