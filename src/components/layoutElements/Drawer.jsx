import { XCircleIcon } from '@heroicons/react/24/outline';
import { useFirebaseAuth } from '@ugrc/utah-design-system';
import { clsx } from 'clsx';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import DefaultFallback from '../pageElements/ErrorBoundary.jsx';
import Logo from '../pageElements/Logo.jsx';

const version = import.meta.env.PACKAGE_VERSION;

const SubmissionProvider = lazy(() =>
  import('../contexts/SubmissionContext.jsx').then((module) => ({
    default: module.SubmissionProvider,
  })),
);
const CornerSubmission = lazy(() => import('../pageElements/CornerSubmission/CornerSubmission.jsx'));
const MyContent = lazy(() => import('../pageElements/MyContent.jsx'));
const AddPoint = lazy(() => import('../pageElements/AddPoint.jsx'));
const Identify = lazy(() => import('../pageElements/Identify.jsx'));
const Login = lazy(() => import('../pageElements/Login.jsx'));
const Profile = lazy(() => import('../pageElements/Profile.jsx'));
const Welcome = lazy(() => import('../pageElements/Welcome.jsx'));
const Legend = lazy(() => import('../pageElements/Legend.jsx'));

/**
 * @typedef {Object} DrawerProps
 * @property {function} [dispatch]
 * @property {boolean} [authenticated]
 * @property {Object} [graphic]
 * @property {Object} [map]
 * @property {Object} [addPoint]
 * @property {string} [activeComponent]
 * @property {boolean} [drawerOpen]
 * @property {{blmPointId: string, type: string}} [submission]
 */

/**
 * @type {React.FC<DrawerProps>}
 */
export default function Drawer({ dispatch, authenticated, map, addPoint, activeComponent, drawerOpen, submission }) {
  const { currentUser } = useFirebaseAuth();
  const scrollContainer = useRef();

  useEffect(() => {
    scrollContainer.current?.scrollTo(0, 0);
  }, [activeComponent]);

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
      'border',
      'border-slate-500',
      'sm:border-0',
      'sm:rounded-t-none',
      'px-4',
      'py-4',
      'sm:pb-12',
      'overflow-auto',
      'z-10',
    ],
    {
      'drawer--closed': !drawerOpen,
    },
  );

  const getComponent = (componentName) => {
    switch (componentName) {
      case 'login': {
        return <Login dispatch={dispatch} authenticated={authenticated} />;
      }
      case 'profile': {
        return <Profile dispatch={dispatch} />;
      }
      case 'points': {
        return currentUser !== undefined ? (
          <AddPoint {...addPoint} active={map.activeTool === 'add-point'} dispatch={dispatch} />
        ) : (
          <Login dispatch={dispatch} authenticated={authenticated} />
        );
      }
      case 'content': {
        return currentUser !== undefined ? (
          <MyContent dispatch={dispatch} />
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
        return <Identify authenticated={currentUser !== undefined} graphic={map.graphic} dispatch={dispatch} />;
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
    <aside ref={scrollContainer} className={classes}>
      <Logo version={version} t />
      <XCircleIcon
        className="absolute top-6 right-4 h-8 w-8 cursor-pointer text-sky-800 hover:text-sky-400"
        onClick={() => dispatch({ type: 'menu/toggle', payload: '' })}
      />
      <ErrorBoundary
        FallbackComponent={DefaultFallback}
        onReset={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}
      >
        <Suspense fallback={<div>loading...</div>}>{getComponent(activeComponent)}</Suspense>
      </ErrorBoundary>
    </aside>
  );
}
