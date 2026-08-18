import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import useLocalStorage from '@ugrc/utilities/hooks/useLocalStorage';
import { clsx } from 'clsx';
import { lazy, useEffect, useRef, type Dispatch } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Button } from '../../formElements/Buttons.tsx';
import usePageView from '../../hooks/usePageView.ts';
import type { AppAction } from '../../reducers/AppReducer.ts';
import DefaultFallback from '../ErrorBoundary.tsx';
const SubmissionNotice = lazy(() => import('./SubmissionNotice.tsx'));
const MonumentPdf = lazy(() => import('./Pdf.tsx'));
const Metadata = lazy(() => import('./Metadata.tsx'));
const CoordinatePicker = lazy(() => import('./Datum.tsx'));
const GridCoordinates = lazy(() => import('./GridCoordinates.tsx'));
const Images = lazy(() => import('./Images.tsx'));
const Review = lazy(() => import('./SubmissionReview.tsx'));
const SubmissionSuccess = lazy(() => import('./SubmissionSuccess.tsx'));
const GeographicHeight = lazy(() =>
  import('./GeographicCoordinates.tsx').then((module) => ({
    default: module.GeographicHeight,
  })),
);
const Latitude = lazy(() =>
  import('./GeographicCoordinates.tsx').then((module) => ({
    default: module.Latitude,
  })),
);
const Longitude = lazy(() =>
  import('./GeographicCoordinates.tsx').then((module) => ({
    default: module.Longitude,
  })),
);

type CornerSubmissionProps = {
  dispatch: Dispatch<AppAction | undefined>;
  submission: {
    blmPointId: string;
    county?: string;
    type: 'existing' | 'new';
  };
};

export default function CornerSubmission({ submission, dispatch }: CornerSubmissionProps) {
  const [hide, setHide] = useLocalStorage('plssSubmissionNoteVisible', false, true);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [state, send] = useSubmissionContext();
  const { analytics, logEvent } = usePageView('screen-submission-start');

  const pointId = submission.blmPointId;

  useEffect(() => {
    send({ type: 'start submission', submission: submission.type } as never);
    logEvent(analytics, 'submission-start', { type: submission.type });
  }, [submission.type, send, analytics, logEvent]);

  useEffect(() => {
    scrollContainer.current?.scrollTo(0, 0);
  }, [state]);

  const Icon = !hide ? MinusCircleIcon : PlusCircleIcon;

  const getFormPart = (snapshot: typeof state) => {
    switch (true) {
      case snapshot.matches({ form: 'uploading existing pdf' }):
        return <MonumentPdf dispatch={dispatch} />;
      case snapshot.matches({ form: 'adding metadata' }):
        return <Metadata dispatch={dispatch} />;
      case snapshot.matches({ form: 'choosing datum' }):
        return <CoordinatePicker />;
      case snapshot.matches({ form: 'entering latitude' }):
      case snapshot.matches({ form: 'entering alternate latitude' }):
        return <Latitude />;
      case snapshot.matches({ form: 'entering longitude' }):
      case snapshot.matches({ form: 'entering alternate longitude' }):
        return <Longitude />;
      case snapshot.matches({ form: 'entering ellipsoid height' }):
      case snapshot.matches({ form: 'entering alternate ellipsoid height' }):
        return <GeographicHeight />;
      case snapshot.matches({ form: 'entering grid coordinates' }):
      case snapshot.matches({ form: 'entering alternate grid coordinates' }):
        return <GridCoordinates />;
      case snapshot.matches({ form: 'uploading photos' }):
        return <Images />;
      case snapshot.matches({ form: 'reviewing' }):
        return <Review />;
      case snapshot.matches({ form: 'idle' }):
        return <SubmissionSuccess dispatch={dispatch} />;
      default:
        logEvent(analytics, 'submission-error', { state: snapshot.value });
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
