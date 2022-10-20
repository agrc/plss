import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ErrorBoundary } from 'react-error-boundary';
import { useSigninCheck } from 'reactfire';
import Logo from '../pageElements/Logo.jsx';

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
    <div role="alert">
      <p>Something went wrong:</p>
      <p>{error.message}</p>
      <button onClick={() => resetErrorBoundary()}>Try again</button>
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
  graphic,
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
      'bg-slate-600',
      'text-white',
      'max-w-screen',
      'shadow-2xl',
      'border',
      'border-indigo-700',
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
        return <Welcome />;
      }
      case 'legend': {
        return <Legend />;
      }
      case 'identify': {
        return <Identify graphic={graphic} dispatch={dispatch} />;
      }
      case 'submission': {
        return (
          <SubmissionProvider context={submission}>
            <CornerSubmission submission={submission} dispatch={dispatch} />
          </SubmissionProvider>
        );
      }
    }
  };

  return (
    <aside className={classes}>
      <Logo />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}
      >
        <Suspense fallback={<div>loading...</div>}>
          {getComponent(activeComponent)}
          {/* <Routes path="/">
            {signInCheckResult?.signedIn && (
              <>
                <Route path="submission" element={<CornerSubmission />}>
                  <Route path=":existing">
                    <Route path=":id" element={<MonumentPdf />} />
                    <Route
                      path=":id/coordinates"
                      element={<CoordinatePicker />}
                    />
                    <Route
                      path=":id/coordinates/geographic/:system/northing"
                      element={<Latitude />}
                    />
                    <Route
                      path=":id/coordinates/geographic/:system/easting"
                      element={<Longitude />}
                    />
                    <Route
                      path=":id/coordinates/geographic/:system/height"
                      element={<GeographicHeight />}
                    />
                    <Route
                      path=":id/coordinates/grid/:system"
                      element={<GridCoordinates />}
                    />
                    <Route path=":id/review" element={<Review />} />
                  </Route>
                  <Route path=":id" element={<Metadata />} />
                  <Route
                    path=":id/coordinates"
                    element={<CoordinatePicker />}
                  />
                  <Route
                    path=":id/coordinates/geographic/:system/northing"
                    element={<Latitude />}
                  />
                  <Route
                    path=":id/coordinates/geographic/:system/easting"
                    element={<Longitude />}
                  />
                  <Route
                    path=":id/coordinates/geographic/:system/height"
                    element={<GeographicHeight />}
                  />
                  <Route
                    path=":id/coordinates/grid/:system"
                    element={<GridCoordinates />}
                  />
                  <Route path=":id/images" element={<Images />} />
                  <Route path=":id/review" element={<Review />} />
                </Route>
                <Route
                  path="my-content"
                  element={<MyContent content={userPoints} />}
                />
                <Route
                  path="add-point"
                  element={
                    <AddPoint
                      {...addPoint}
                      active={map.activeTool === 'add-point'}
                      dispatch={dispatch}
                    />
                  }
                />
              </>
            )}
          */}
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
