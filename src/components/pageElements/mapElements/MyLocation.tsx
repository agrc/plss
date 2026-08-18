import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { ComponentRef } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';
import { machine as geolocationMachine } from '../../machines/geolocation.ts';
import type { AppDispatch } from '../contentTypes.ts';
import useGeolocation from './useGeoLocation.ts';

type MyLocationProps = {
  dispatch?: AppDispatch;
};

type GeolocationSnapshot = SnapshotFrom<typeof geolocationMachine>;
type GeolocationSend = ActorRefFrom<typeof geolocationMachine>['send'];

export default function MyLocation({ dispatch }: MyLocationProps) {
  const node = useRef<HTMLDivElement>(null);
  const count = useRef(1);
  const [state, send] = useGeolocation();
  const { position } = state.context;

  useEffect(() => {
    if (position) {
      if (count.current === 1) {
        dispatch?.({ type: 'map/set-gps-location', payload: position });
      } else {
        dispatch?.({ type: 'map/update-gps-location', payload: position });
      }

      count.current++;
    }
  }, [dispatch, position]);

  return <GpsButton ref={node} state={state} send={send} />;
}

type GpsButtonProps = {
  send: GeolocationSend;
  state: GeolocationSnapshot;
};

export const GpsButton = forwardRef<ComponentRef<'div'>, GpsButtonProps>(({ state, send }, ref) => {
  return (
    <div className="relative flex h-8 w-8 rounded-full bg-white shadow-xs" ref={ref}>
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
        className={clsx('flex flex-1 items-center justify-center rounded-full', {
          'cursor-pointer bg-white': state.matches('idle'),
          'cursor-not-allowed bg-slate-300': state.matches('notSupported'),
          'cursor-progress bg-sky-400': state.matches({ tracking: 'requesting' }),
          'cursor-pointer bg-red-700': state.matches('error'),
        })}
      >
        {state.matches({ tracking: 'active' }) && (
          <span className="absolute flex h-6 w-6 justify-center">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-sky-200/75"></span>
            <span className="inline-flex h-1 w-1 self-center rounded-full bg-sky-400"></span>
          </span>
        )}
        <ViewfinderCircleIcon
          className={clsx('h-6 w-6', {
            'text-slate-700': state.matches('idle') || state.matches({ tracking: 'active' }),
            'text-white motion-safe:animate-spin': state.matches({ tracking: 'requesting' }),
            'text-white': state.matches('error') || state.matches('notSupported'),
          })}
        />
      </button>
    </div>
  );
});
GpsButton.displayName = 'GpsButton';
