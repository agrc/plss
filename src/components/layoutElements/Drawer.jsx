import { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useSigninCheck } from 'reactfire';
import Logo from '../pageElements/Logo.jsx';

const CornerSubmission = lazy(() =>
  import('../pageElements/CornerSubmission/CornerSubmission.jsx')
);
const MyContent = lazy(() => import('../pageElements/MyContent.jsx'));
const AddPoint = lazy(() => import('../pageElements/AddPoint.jsx'));
const Identify = lazy(() => import('../pageElements/Identify.jsx'));
const Login = lazy(() => import('../pageElements/Login.jsx'));
const Metadata = lazy(() =>
  import('../pageElements/CornerSubmission/Metadata.jsx')
);
const CoordinatePicker = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.CoordinatePicker,
  }))
);
const GeographicHeight = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.GeographicHeight,
  }))
);
const GridCoordinates = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.GridCoordinates,
  }))
);
const Latitude = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.Latitude,
  }))
);
const Longitude = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.Longitude,
  }))
);
const Review = lazy(() =>
  import('../pageElements/CornerSubmission/Coordinates.jsx').then((module) => ({
    default: module.Review,
  }))
);
const Legend = lazy(() => import('../pageElements/Legend.jsx'));
const Images = lazy(() =>
  import('../pageElements/CornerSubmission/Images.jsx')
);

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

export default function Drawer({
  dispatch,
  authenticated,
  graphic,
  map,
  addPoint,
  userPoints,
}) {
  const open = useDrawerOpen();
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
      'drawer--closed': !open,
    }
  );

  return (
    <aside className={classes}>
      <Logo />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<div>loading...</div>}>
          <Routes path="/">
            {signInCheckResult?.signedIn && (
              <>
                <Route path="submission" element={<CornerSubmission />}>
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
            <Route
              path="login"
              element={
                <Login dispatch={dispatch} authenticated={authenticated} />
              }
            />
            <Route path="legend" element={<Legend />} />
            <Route path="identify" element={<Identify graphic={graphic} />} />
            <Route path="*" element={<>404</>} />
          </Routes>
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
};

export const useDrawerOpen = () => {
  const location = useLocation();
  const [drawOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(location?.pathname !== '/');
  }, [location.pathname]);

  return drawOpen;
};
