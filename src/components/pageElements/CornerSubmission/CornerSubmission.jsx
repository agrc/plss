import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useLocalStorage } from '@ugrc/utilities/hooks';
import { clsx } from 'clsx';
import { lazy, useContext, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import usePageView from '../../hooks/usePageView.jsx';
import DefaultFallback from '../ErrorBoundary.jsx';
const SubmissionNotice = lazy(() => import('./SubmissionNotice.jsx'));
const MonumentPdf = lazy(() => import('./Pdf.jsx'));
const Metadata = lazy(() => import('./Metadata.jsx'));
const CoordinatePicker = lazy(() => import('./Datum.jsx'));
const GridCoordinates = lazy(() => import('./GridCoordinates.jsx'));
const Images = lazy(() => import('./Images.jsx'));
const Review = lazy(() => import('./SubmissionReview.jsx'));
const SubmissionSuccess = lazy(() => import('./SubmissionSuccess.jsx'));
const GeographicHeight = lazy(() =>
  import('./GeographicCoordinates.jsx').then((module) => ({
    default: module.GeographicHeight,
  })),
);
const Latitude = lazy(() =>
  import('./GeographicCoordinates.jsx').then((module) => ({
    default: module.Latitude,
  })),
);
const Longitude = lazy(() =>
  import('./GeographicCoordinates.jsx').then((module) => ({
    default: module.Longitude,
  })),
);

/**
 * @typedef {Object} CornerSubmissionProps
 * @property {Object} submission
 * @property {string} submission.blmPointId
 * @property {string} submission.type
 * @property {string} [submission.county]
 * @property {function} dispatch
 */

/**
 * @type {React.FC<CornerSubmissionProps>}
 */
export default function CornerSubmission({ submission, dispatch }) {
  const [hide, setHide] = useLocalStorage('plssSubmissionNoteVisible', false, true);
  const scrollContainer = useRef(null);
  const [state, send] = useContext(SubmissionContext);
  const { analytics, logEvent } = usePageView('screen-submission-start');

  const pointId = submission.blmPointId;

  useEffect(() => {
    send({ type: 'start submission', submission: submission.type });
    logEvent(analytics, 'submission-start', { type: submission.type });
  }, [submission.type, send, analytics, logEvent]);

  useEffect(() => {
    scrollContainer.current?.scrollTo(0, 0);
  }, [state]);

  const Icon = !hide ? MinusCircleIcon : PlusCircleIcon;

  const getFormPart = (state) => {
    switch (true) {
      case state.matches('form.uploading existing pdf'):
        return <MonumentPdf dispatch={dispatch} />;
      case state.matches('form.adding metadata'):
        return <Metadata dispatch={dispatch} />;
      case state.matches('form.choosing datum'):
        return <CoordinatePicker />;
      case state.matches('form.entering latitude'):
      case state.matches('form.entering alternate latitude'):
        return <Latitude />;
      case state.matches('form.entering longitude'):
      case state.matches('form.entering alternate longitude'):
        return <Longitude />;
      case state.matches('form.entering ellipsoid height'):
      case state.matches('form.entering alternate ellipsoid height'):
        return <GeographicHeight />;
      case state.matches('form.entering grid coordinates'):
      case state.matches('form.entering alternate grid coordinates'):
        return <GridCoordinates />;
      case state.matches('form.uploading photos'):
        return <Images />;
      case state.matches('form.reviewing'):
        return <Review />;
      case state.matches('form.idle'):
        return <SubmissionSuccess dispatch={dispatch} />;
      default:
        logEvent(analytics, 'submission-error', { state: state.value });
        return (
          <div role="alert" data-area="drawer">
            <h3 className="text-lg font-bold">Something went wrong</h3>
            <p className="m-4 rounded-sm border p-4">
              No matching component for {JSON.stringify(state.value, null, 2)} state.
            </p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => send({ type: 'BACK' })}>Back</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="relative">
        <Icon
          className={clsx('h-6 w-6 cursor-pointer', {
            hidden: !hide,
          })}
          onClick={() => {
            setHide(!hide);
            logEvent(analytics, 'submission-notice-visibility', {
              hide: !hide,
            });
          }}
        />
      </div>
      {!hide && (
        <SubmissionNotice
          pointId={pointId}
          county={submission.county}
          toggle={() => {
            setHide(!hide);
            logEvent(analytics, 'submission-notice-visibility', {
              hide: !hide,
            });
          }}
        />
      )}
      <div ref={scrollContainer} className="mb-2 flex-1 overflow-y-auto pb-2">
        <ErrorBoundary
          FallbackComponent={DefaultFallback}
          onReset={() => {
            send({ type: 'BACK' });
            logEvent(analytics, 'submission-error-boundary', { state: state });
          }}
        >
          {getFormPart(state)}
        </ErrorBoundary>
      </div>
    </>
  );
}
