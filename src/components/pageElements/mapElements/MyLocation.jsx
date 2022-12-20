import { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useGeolocation from './useGeoLocation.js';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import { useMapReady } from '@ugrc/utilities/hooks';

export default function MyLocation({ view, dispatch, width }) {
  const node = useRef();
  const count = useRef(1);
  const ready = useMapReady(view);
  const [state, send] = useGeolocation();
  const { position } = state.context;

  useEffect(() => {
    if (position) {
      let type = 'map/gps-location-update';

      if (count.current === 1) {
        type = 'map/set-gps-location';
      }

      dispatch({ type, payload: position });
      count.current++;
    }
  }, [dispatch, position]);

  useEffect(() => {
    if (ready && node.current) {
      view.ui.add(node.current, width > 640 ? 'bottom-right' : 'top-left');
    }
    const handle = node.current;

    () => view?.ui.remove(handle);
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
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();

          if (state.matches('notSupported')) {
            console.log('geolocation', state.value);
            return;
          }

          console.log('current state', state.value);

          if (state.matches('resolved')) {
            console.log('geolocation', 'cancelling location request');
            send('CANCEL');

            return;
          }

          console.log('geolocation', 'requesting location');
          send('LOCATION REQUESTED');
        }}
        className={clsx(
          'flex flex-1 items-center justify-center rounded-full',
          {
            'cursor-pointer bg-white':
              state.matches('gps.idle') || state.matches('resolved'),
            'cursor-not-allowed bg-slate-300': state.matches('notSupported'),
            'cursor-progress bg-sky-400': state.matches('gps.pending'),
            'cursor-pointer bg-red-700': state.matches('rejected'),
          }
        )}
      >
        {state.matches('resolved') && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-sky-600/80"></span>
          </span>
        )}
        <ViewfinderCircleIcon
          className={clsx('h-6 w-6', {
            'text-slate-700':
              state.matches('gps.idle') || state.matches('resolved'),
            'text-slate-300': state.matches('notSupported'),
            'text-white motion-safe:animate-spin': state.matches('gps.pending'),
            'text-white': state.matches('rejected'),
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
