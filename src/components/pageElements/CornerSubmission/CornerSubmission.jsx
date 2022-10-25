/* eslint-disable no-unused-vars */
import { lazy, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { createStore, StateMachineProvider } from 'little-state-machine';
import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';
import extractTownshipInformation from './blmPointId.mjs';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { Button } from '../../formElements/Buttons.jsx';

const MonumentPdf = lazy(() => import('./Pdf.jsx'));
const Metadata = lazy(() => import('./Metadata.jsx'));
const CoordinatePicker = lazy(() => import('./Datum.jsx'));
const GridCoordinates = lazy(() => import('./GridCoordinates.jsx'));
const Images = lazy(() => import('./Images.jsx'));
const Review = lazy(() => import('./SubmissionReview.jsx'));
const GeographicHeight = lazy(() =>
  import('./GeographicCoordinates.jsx').then((module) => ({
    default: module.GeographicHeight,
  }))
);
const Latitude = lazy(() => import('./GeographicCoordinates.jsx'));
const Longitude = lazy(() =>
  import('./GeographicCoordinates.jsx').then((module) => ({
    default: module.Longitude,
  }))
);

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" data-area="submission">
      <h1 className="text-lg font-bold">Something went wrong</h1>
      <p className="m-4 rounded border p-4 text-sm">{error.message}</p>
      <div className="mt-4 flex justify-center">
        <Button onClick={() => resetErrorBoundary()}>Reset</Button>
      </div>
    </div>
  );
}
ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default function CornerSubmission({ submission }) {
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
    console.log('state change', state.value);
    switch (true) {
      case state.matches('uploading existing pdf'):
        return <MonumentPdf />;
      case state.matches('adding metadata'):
        return <Metadata />;
      case state.matches('choosing datum'):
        return <CoordinatePicker />;
      case state.matches('entering latitude'):
      case state.matches('entering alternate latitude'):
        return <Latitude />;
      case state.matches('entering longitude'):
      case state.matches('entering alternate longitude'):
        return <Longitude />;
      case state.matches('entering ellipsoid height'):
      case state.matches('entering alternate ellipsoid height'):
        return <GeographicHeight />;
      case state.matches('entering grid coordinates'):
      case state.matches('entering alternate grid coordinates'):
        return <GridCoordinates />;
      case state.matches('uploading photos'):
        return <Images />;
      case state.matches('reviewing'):
        return <Review />;
      default:
        return (
          <div role="alert" data-area="drawer">
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="m-4 rounded border p-4">
              No matching component for {state.value} state.
            </p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => send('BACK')}>Back</Button>
            </div>
          </div>
        );
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
          onReset={() => send('BACK')}
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
