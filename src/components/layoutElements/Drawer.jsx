import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ErrorBoundary } from 'react-error-boundary';
import { useSigninCheck } from 'reactfire';
import Logo from '../pageElements/Logo.jsx';
import { Button } from '../formElements/Buttons.jsx';
import { XCircleIcon } from '@heroicons/react/24/outline';

const SubmissionProvider = lazy(() =>
  import('../contexts/SubmissionContext.jsx').then((module) => ({
    default: module.SubmissionProvider,
  }))
);
const CornerSubmission = lazy(() =>
  import('../pageElements/CornerSubmission/CornerSubmission.jsx')
);
const MyContent = lazy(() => import('../pageElements/MyContent.jsx'));
const AddPoint = lazy(() => import('../pageElements/AddPoint.jsx'));
const Identify = lazy(() => import('../pageElements/Identify.jsx'));
const Login = lazy(() => import('../pageElements/Login.jsx'));
const Welcome = lazy(() => import('../pageElements/Welcome.jsx'));
const Legend = lazy(() => import('../pageElements/Legend.jsx'));

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" data-area="drawer">
      <h1 className="text-lg font-bold">Something went wrong</h1>
      <p className="rounded border p-4">{error.message}</p>
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

export default function Drawer({
  dispatch,
  authenticated,
  map,
  addPoint,
  userPoints,
  activeComponent,
  drawerOpen,
  submission,
}) {
  const { data: signInCheckResult } = useSigninCheck();

  const classes = clsx(
    [
      'flex',
      'flex-col',
      'drawer',
      'bg-slate-50',
      'text-sky-900',
      'max-w-screen',
      'shadow-2xl',
      'rounded-t-2xl',
      'sm:rounded-t-none',
      'px-4',
      'py-4',
      'md:pb-12',
      'overflow-auto',
      'z-10',
    ],
    {
      'drawer--closed': !drawerOpen,
    }
  );

  const getComponent = (componentName) => {
    switch (componentName) {
      case 'login': {
        return <Login dispatch={dispatch} authenticated={authenticated} />;
      }
      case 'points': {
        return signInCheckResult?.signedIn ? (
          <AddPoint
            {...addPoint}
            active={map.activeTool === 'add-point'}
            dispatch={dispatch}
          />
        ) : (
          <Login dispatch={dispatch} authenticated={authenticated} />
        );
      }
      case 'content': {
        return signInCheckResult?.signedIn ? (
          <MyContent content={userPoints} />
        ) : (
          <Login dispatch={dispatch} authenticated={authenticated} />
        );
      }
      case 'welcome': {
        return <Welcome dispatch={dispatch} />;
      }
      case 'legend': {
        return <Legend />;
      }
      case 'identify': {
        return (
          <Identify
            authenticated={signInCheckResult.signedIn}
            graphic={map.graphic}
            dispatch={dispatch}
          />
        );
      }
      case 'submission': {
        return (
          <SubmissionProvider context={submission}>
            <CornerSubmission
              submission={{
                ...submission,
                county: map.graphic?.attributes?.county,
              }}
              dispatch={dispatch}
            />
          </SubmissionProvider>
        );
      }
    }
  };

  return (
    <aside className={classes}>
      <Logo />
      <XCircleIcon
        className="absolute top-6 right-4 h-8 w-8 cursor-pointer text-sky-800 hover:text-sky-400"
        onClick={() => dispatch({ type: 'menu/toggle', payload: '' })}
      />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}
      >
        <Suspense fallback={<div>loading...</div>}>
          {getComponent(activeComponent)}
        </Suspense>
      </ErrorBoundary>
    </aside>
  );
}
Drawer.propTypes = {
  dispatch: PropTypes.func,
  authenticated: PropTypes.bool,
  graphic: PropTypes.object,
  map: PropTypes.object,
  addPoint: PropTypes.object,
  userPoints: PropTypes.array,
  activeComponent: PropTypes.string,
  drawerOpen: PropTypes.bool,
  submission: PropTypes.shape({
    blmPointId: PropTypes.string,
    type: PropTypes.string,
  }),
};
