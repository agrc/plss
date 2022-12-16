import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import Graphic from '@arcgis/core/Graphic';
import { send } from 'vite';

const updatePosition = assign({
  position: (_, event) => {
    console.log('updatePosition', event);
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
});
const updateError = assign({
  error: (_, event) => event.error.message,
});

const geoService = () => (callback, onReceive) => {
  if (!navigator.geolocation) {
    callback({
      type: 'notSupported',
      error: new Error('Geolocation is not supported'),
    });

    return;
  }

  const geoWatch = navigator.geolocation.watchPosition(
    (position) => callback({ type: 'success', position }),
    (error) => callback({ type: 'error', error }),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );

  onReceive((event) => {
    console.log('received', event.type);

    if (event.type === 'STOP') {
      navigator.geolocation.clearWatch(geoWatch);
    }
  });

  // disposal function
  return () => navigator.geolocation.clearWatch(geoWatch);
};

const geolocationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwPYBsUGMCGAXAligHYDEORmYaakA2gAwC6ioADirPgcSyAB6IALPUEA6AIwAOAEz0AnADZpAdjn0AzHMkAaEAE9EAWnVjJg6ZMVzlg5QFZlkhQF9nu1BhzdSsAK6ZKWFgGZiQQdk5vXgEEcTtxUQV1ehtBNPF6aSVdA1i7dUSlSUkNOTUMyWVXdzB0LDxCUjAAJ2aUZpDeCK5G6MQVUUEFDUk423Ek6wUcxDiChSKSzXL6GWqQD3rvEiIUXABlX1Z2Ztw6Ji6OHp4wmPVxBOkHGVtZa2lFGbz5xdKVtbcG1qngaxFEUFYsFE+AgNBIABkAPIAYQAggAVACSiIAcgACABKAFEAIoAVSJ+3RRIAIp0wt0ordEAs5KJlOp7JIHOpubydPpZvZRIppOp1BY7LJ1HYFFVAZsvI1RM04OgAG6QEhonHIonw+lsK5M0AxcTKaQihT5BRyWy260Sr7mZSiaSCGX0G12Oz0BbrRWgogqsAAKzAmDOEG1qN1+sN4WNvWZCE07LMdjKWkU4k0AtyUoUIom1rFymUD2k0lcgN2EDgvEDJsTkWTpqMslE+RzGYs6mG7q+hnEVdEEreNgUI-yHoDwK2yoh8AZSZu7YQ+Ukonk5ps9HNvPkX2tg0qmTl9yGgh9c7qSrBS+hsLAl1ba-4iDsTm3cl3wgPJRyF85pFmkcgWKU5gmOot4gt44KQqIrBgEQED4EQUCvtcRB9AgajzLKZi8g8ygaMowFSlaSgqNI5qKPu1YKvO97BqqsAapAWHNmaNhduBij2LafoqPmiCXuyfpKDK2aCGYsELmCqrhpGnErm+OEpuYiTFO6Qz3E8Vb2F8yRsqRXqCL+WQ7jY8ksaIuwHEcJxRlxbYfqmuZur6+5mR6HLTIKqbyBJfopE4tHxE4tlBqI5CUNQqlGupuEynY7LiGURG+iOMpfPE9BdhoGU8moMhijWzhAA */
  createMachine(
    {
      id: 'geolocation',
      initial: 'gps',
      context: { position: null, error: null },
      preserveActionOrder: true,
      predictableActionArguments: true,
      states: {
        gps: {
          initial: 'idle',
          states: {
            idle: {
              on: { 'LOCATION REQUESTED': 'pending' },
            },
            pending: {
              invoke: {
                id: 'geoService',
                src: 'geoService',
              },
            },
            cancelled: send({ type: 'STOP' }, { to: 'geoService' }),
          },
        },
        resolved: {
          on: {
            CANCEL: 'cancelled',
          },
        },
        rejected: {
          on: {
            CANCEL: 'cancelled',
          },
        },
        notSupported: {},
        cancelled: {},
      },
      on: {
        cancelled: {
          target: 'gps.idle',
        },
        success: {
          target: '.resolved',
          actions: 'updatePosition',
        },
        error: {
          target: '.rejected',
          actions: 'updateError',
        },
        notSupported: {
          target: '.notSupported',
          actions: 'updateError',
        },
      },
    },
    {
      services: { geoService },
      actions: { updatePosition, updateError },
    }
  );

export default function useGeolocation() {
  const [state, send] = useMachine(geolocationMachine);
  return [state, send];
}
