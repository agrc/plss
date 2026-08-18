import Graphic from '@arcgis/core/Graphic.js';
import { assign, fromCallback, setup } from 'xstate';

type GeolocationContext = {
  error: GeolocationPositionError | null;
  position: Graphic | null;
  errorCount: number;
};

type GeolocationEvent =
  | { type: 'START_TRACKING' }
  | { type: 'CANCEL_TRACKING' }
  | { type: 'RETRY_TRACKING' }
  | { type: 'NEW_POSITION'; position: GeolocationPosition }
  | { type: 'ERROR'; error: GeolocationPositionError };

const geoService = fromCallback<GeolocationEvent>(({ sendBack }) => {
  const geoWatch = navigator.geolocation.watchPosition(
    (position) => sendBack({ type: 'NEW_POSITION', position }),
    (error) => sendBack({ type: 'ERROR', error }),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
    },
  );

  return () => navigator.geolocation.clearWatch(geoWatch);
});

export const machine = setup({
  types: {
    context: {} as GeolocationContext,
    events: {} as GeolocationEvent,
  },
  actions: {
    updatePosition: assign({
      position: ({ event }) => {
        if (event.type !== 'NEW_POSITION') {
          return null;
        }

        return new Graphic({
          geometry: {
            type: 'point',
            longitude: event.position.coords.longitude,
            latitude: event.position.coords.latitude,
          },
          symbol: {
            type: 'simple-marker',
            size: 11,
            color: [0, 116, 217, 200],
            outline: {
              color: [255, 255, 255, 255],
              width: 1.6,
            },
          },
          attributes: {},
        });
      },
    }),
    updateError: assign({
      error: ({ event }) =>
        event.type === 'ERROR' ? event.error : null,
      errorCount: ({ context }) => context.errorCount + 1,
    }),
    clearError: assign({ error: () => null }),
  },
  guards: {
    hasSupport: () => !!navigator.geolocation,
    errorThreshold: ({ context }) => context.errorCount < 5,
  },
  actors: { geoService },
}).createMachine({
  id: 'geolocation',
  context: { error: null, position: null, errorCount: 0 },
  initial: 'initializing',
  states: {
    initializing: {
      always: [
        {
          guard: 'hasSupport',
          target: 'idle',
        },
        'notSupported',
      ],
    },
    idle: {
      on: { START_TRACKING: 'tracking' },
    },
    tracking: {
      invoke: { src: 'geoService' },
      on: {
        ERROR: { actions: 'updateError', target: 'error' },
        CANCEL_TRACKING: 'idle',
      },
      initial: 'requesting',
      states: {
        requesting: {
          on: {
            NEW_POSITION: { target: 'active', actions: 'updatePosition' },
          },
        },
        active: {
          on: {
            NEW_POSITION: { actions: 'updatePosition' },
          },
        },
      },
    },
    error: {
      on: {
        RETRY_TRACKING: {
          guard: 'errorThreshold',
          target: 'tracking',
          actions: 'clearError',
        },
      },
    },
    notSupported: { type: 'final' },
  },
});