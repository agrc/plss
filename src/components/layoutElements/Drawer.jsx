import { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Route, Routes, useLocation } from 'react-router-dom';
import Logo from '../pageElements/Logo.jsx';
import { useAuthState } from '../contexts/AuthContext.jsx';

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

export default function Drawer({
  dispatch,
  authenticated,
  graphic,
  map,
  addPoint,
}) {
  const open = useDrawerOpen();
  const { state: userState } = useAuthState();

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
      'pt-4',
      'overflow-hidden',
    ],
    {
      'drawer--closed': !open,
    }
  );

  return (
    <aside className={classes}>
      <Logo />
      <Suspense fallback={<div>loading...</div>}>
        <Routes path="/">
          {userState.state === 'SIGNED_IN' && (
            <>
              <Route path="submission" element={<CornerSubmission />}>
                <Route path="new" element={<Metadata />} />
                <Route path=":id/coordinates" element={<CoordinatePicker />} />
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
              <Route path="my-content" element={<MyContent />} />
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
    </aside>
  );
}
Drawer.propTypes = {
  dispatch: PropTypes.func,
  authenticated: PropTypes.bool,
  graphic: PropTypes.object,
  map: PropTypes.object,
  addPoint: PropTypes.object,
};

export const useDrawerOpen = () => {
  const location = useLocation();
  const [drawOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(location?.pathname !== '/');
  }, [location.pathname]);

  return drawOpen;
};
