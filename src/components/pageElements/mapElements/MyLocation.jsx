import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef } from 'react';
import useGeolocation from './useGeoLocation.js';
import { useMapReady } from '@ugrc/utilities/hooks';

export default function MyLocation({ view, dispatch, width }) {
  const node = useRef();
  const count = useRef(1);
  const ready = useMapReady(view);
  const [state, send] = useGeolocation();
  const { position } = state.context;

  useEffect(() => {
    if (position) {
      let type = 'map/update-gps-location';

      if (count.current === 1) {
        type = 'map/set-gps-location';
      }

      dispatch({ type, payload: position });
      count.current++;
    }
  }, [dispatch, position]);

  useEffect(() => {
    if (ready && node.current) {
      view?.ui?.add(node.current, width > 640 ? 'bottom-right' : 'top-left', 2);
    }
    const handle = node.current;

    () => view?.ui?.remove(handle);
  }, [view, ready, width]);

  if (!ready) {
    return null;
  }

  return <GpsButton ref={node} state={state} send={send} />;
}
MyLocation.propTypes = {
  dispatch: PropTypes.func,
  view: PropTypes.object,
  width: PropTypes.number,
};

export const GpsButton = forwardRef(({ state, send }, ref) => {
  return (
    <div
      className="relative flex h-8 w-8 rounded-full bg-white shadow-sm"
      ref={ref}
    >
      <button
        name="activate geolocation"
        aria-label="activate geolocation"
        title="activate geolocation"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();

          if (state.matches('notSupported')) {
            return;
          }

          if (state.matches('tracking')) {
            send({ type: 'CANCEL_TRACKING' });

            return;
          }

          send({ type: 'START_TRACKING' });
        }}
        className={clsx(
          'flex flex-1 items-center justify-center rounded-full',
          {
            'cursor-pointer bg-white': state.matches('idle'),
            'cursor-not-allowed bg-slate-300': state.matches('notSupported'),
            'cursor-progress bg-sky-400': state.matches('tracking.requesting'),
            'cursor-pointer bg-red-700': state.matches('error'),
          },
        )}
      >
        {state.matches('tracking.active') && (
          <span className="absolute flex h-6 w-6 justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-sky-200/75"></span>
            <span className="inline-flex h-1 w-1 self-center rounded-full bg-sky-400"></span>
          </span>
        )}
        <ViewfinderCircleIcon
          className={clsx('h-6 w-6', {
            'text-slate-700':
              state.matches('idle') || state.matches('tracking.active'),
            'text-white motion-safe:animate-spin': state.matches(
              'tracking.requesting',
            ),
            'text-white':
              state.matches('rejected') || state.matches('notSupported'),
          })}
        />
      </button>
    </div>
  );
});
GpsButton.displayName = 'GpsButton';
GpsButton.propTypes = {
  state: PropTypes.object,
  send: PropTypes.func,
  error: PropTypes.object,
};
