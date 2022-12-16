import { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useGeolocation from './useGeoLocation.js';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import { useMapReady } from '@ugrc/utilities/hooks';

export default function MyLocation({ view, dispatch }) {
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
      view.ui.add(node.current, 'bottom-right');
    }
    const handle = node.current;

    () => view?.ui.remove(handle);
  }, [view, ready]);

  if (!ready) {
    return null;
  }

  return <GpsButton ref={node} state={state} send={send} />;
}
MyLocation.propTypes = {
  dispatch: PropTypes.func,
  view: PropTypes.object,
};

export const GpsButton = forwardRef(({ state, send }, ref) => (
  <div className="mb-[10px] rounded-full shadow-sm" ref={ref}>
    <button
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        if (state.matches('notSupported')) {
          return;
        }

        console.log('current state', state.value);

        if (!state.matches('idle')) {
          send('CANCEL');
        }

        console.log('requesting location');
        send('LOCATION REQUESTED');
      }}
      className={clsx('rounded-full p-2', {
        'cursor-pointer bg-white': state.matches('gps.idle'),
        'cursor-not-allowed bg-slate-300': state.matches('notSupported'),
        'cursor-progress bg-sky-400': state.matches('gps.pending'),
        'cursor-pointer bg-slate-800': state.matches('resolved'),
        'cursor-pointer bg-red-700': state.matches('rejected'),
      })}
    >
      <ViewfinderCircleIcon
        className={clsx('h-6 w-6', {
          'text-slate-800': state.matches('gps.idle'),
          'text-slate-700': state.matches('notSupported'),
          'text-white motion-safe:animate-spin': state.matches('gps.pending'),
          'text-sky-400 motion-safe:animate-pulse': state.matches('resolved'),
          'text-white': state.matches('rejected'),
        })}
      />
    </button>
  </div>
));
GpsButton.displayName = 'GpsButton';
GpsButton.propTypes = {
  state: PropTypes.object,
  send: PropTypes.func,
  error: PropTypes.object,
};
