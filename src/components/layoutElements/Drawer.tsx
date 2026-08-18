import { XCircleIcon } from '@heroicons/react/24/outline';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { clsx } from 'clsx';
import { lazy, type ComponentProps, type Dispatch, type ReactNode, Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { SubmissionMachineContext } from '../machines/index.ts';
import DefaultFallback from '../pageElements/ErrorBoundary.tsx';
import Logo from '../pageElements/Logo.tsx';
import type { AppAction, AppState } from '../reducers/AppReducer.ts';

const version = import.meta.env.PACKAGE_VERSION;

const SubmissionProvider = lazy(() =>
  import('../contexts/SubmissionContext.tsx').then((module) => ({
    default: module.SubmissionProvider,
  })),
);
const CornerSubmission = lazy(() => import('../pageElements/CornerSubmission/CornerSubmission.tsx'));
const MyContent = lazy(() => import('../pageElements/MyContent.tsx'));
const AddPoint = lazy(() => import('../pageElements/AddPoint.tsx'));
const Identify = lazy(() => import('../pageElements/Identify.tsx'));
const Login = lazy(() => import('../pageElements/Login.tsx'));
const Profile = lazy(() => import('../pageElements/Profile.tsx'));
const Welcome = lazy(() => import('../pageElements/Welcome.tsx'));
const Legend = lazy(() => import('../pageElements/Legend.tsx'));

type DrawerProps = Pick<AppState, 'activeComponent' | 'addPoint' | 'drawerOpen' | 'map' | 'submission'> & {
  dispatch: Dispatch<AppAction | undefined>;
};

type AddPointProps = ComponentProps<typeof AddPoint>;
type IdentifyProps = ComponentProps<typeof Identify>;
type CornerSubmissionInput = ComponentProps<typeof CornerSubmission>['submission'] & SubmissionMachineContext;

const isPointGeometry = (value: unknown): value is NonNullable<AddPointProps['geometry']> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { x?: unknown }).x === 'number' &&
    typeof (value as { y?: unknown }).y === 'number'
  );
};

const isIdentifyGraphic = (value: unknown): value is NonNullable<IdentifyProps['graphic']> => {
  return typeof value === 'object' && value !== null && 'attributes' in value;
};

const isCornerSubmission = (value: unknown): value is CornerSubmissionInput => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const submission = value as { blmPointId?: unknown; type?: unknown };

  return (
    typeof submission.blmPointId === 'string' &&
    (submission.type === 'existing' || submission.type === 'new')
  );
};

export default function Drawer({ dispatch, map, addPoint, activeComponent, drawerOpen, submission }: DrawerProps) {
  const { currentUser } = useFirebaseAuth();
  const scrollContainer = useRef<HTMLElement>(null);

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

  const getComponent = (componentName: AppState['activeComponent']): ReactNode => {
    switch (componentName) {
      case 'login': {
        return <Login dispatch={dispatch} />;
      }
      case 'profile': {
        return <Profile dispatch={dispatch} />;
      }
      case 'points': {
        return currentUser !== undefined ? (
          <AddPoint
            color={addPoint.color}
            geometry={isPointGeometry(addPoint.geometry) ? addPoint.geometry : undefined}
            active={map.activeTool === 'add-point'}
            dispatch={dispatch}
          />
        ) : (
          <Login dispatch={dispatch} />
        );
      }
      case 'content': {
        return currentUser !== undefined ? (
          <MyContent dispatch={dispatch} />
        ) : (
          <Login dispatch={dispatch} />
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
            authenticated={currentUser !== undefined}
            graphic={isIdentifyGraphic(map.graphic) ? map.graphic : undefined}
            dispatch={dispatch}
          />
        );
      }
      case 'submission': {
        if (!isCornerSubmission(submission)) {
          return null;
        }

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
      <Logo version={version} />
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
