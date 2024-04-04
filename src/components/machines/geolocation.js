import { createMachine, assign } from 'xstate';
import Graphic from '@arcgis/core/Graphic';

const updatePosition = assign({
  position: (_, event) => {
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

function geoService() {
  return (cb) => {
    const geoWatch = navigator.geolocation.watchPosition(
      (position) => cb({ type: 'NEW_POSITION', position }),
      (error) => cb({ type: 'ERROR', error }),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      },
    );

    return () => navigator.geolocation.clearWatch(geoWatch);
  };
}

// https://xstate.js.org/viz/?gist=69dde705f0db39b7860c1dc3ec6ac682
export default function () {
  /** @xstate-layout N4IgpgJg5mDOIC5QwPYBsUGMCGAXAligHYB0+R+B2a+AXuVAMQDaADALqKgAOKslhIlxAAPRAGZJJAOwBOAKyzWANhWtxARlbTlAGhABPRBoAs8kq1kaAHMvmtrGgEwnlT+QF8P+1BhwFiMgoqGnoiJmYNTiQQXn4AoRixBHkNc2VraRNxMyV5Nyd9IwRTc0sbHXEnJ3EFWWUvHzB0LDxBMgg0MEYAZQAVAEEAJT6AfT6hgYBhAGkASQA5AHE2aJ4+AWJhZI1laRl5aWkna2tLY6q9Q0QnWScSWRNLWWk0uQ0jxpBfVoSSXAATthMABrBiMACiQyGAHkhqthHFNolQMlpOYTI5xNYTq5pM9CtcEOiNBYXMpVOprPJrCZZF8fv52oDgWDwowpgMFlMIQAZcaTWaLFYcREbBLbRB0+74-I1VzycQOK7FW73R5aBy1JR7EzSBnNPxtQIs0EMEgAsAARwArnACOyFhCAOqjAAKMJ6cz6cxhCwRMSREqSxl2JFu1JqNNYijp0iKiEO1ge0dcqhM7nknm830Nv2ZQLN4RIwIIADduk7XR6vT6-QH1vFBJKUk5WCQNFUs85rFYTHSEylpMmFGc06wM1ns00WkzAmAAQCUADGEMIRMAJoC6bzZYN2Li5shhBPcQd9T4mO7I57eNEklkvXOOMnHJeHNEFAQODCRnGlEHk2WzHm24ayJG4jRrGLwmIOWYkJBkGyNiirvHIBqzv+QQCNQdAMGKQEAWi5g6A4yEKMOlQqsYGYkNYVTolmOKdrSGFGn8+CdGABHIi24johYw6Ys4ihOB88iwUS1T3HS-FHG27jSWx+YmoWbJQDxwaoogGRgRBUGPC8g7YiYHZKg4ElmM4lTKXOpCmupFrWnasAOhpgaHsB2klOIyjhtS9idk4dh5PIcE2CQhwSawz5KiYna2VhDnmqW+AVppR7eTksgyP2nb5Di6LxYOyidoJVTUrUOR0g0OZ-n8C5LgCGVeaINzKDlmR6qwKhZGcvmDkcZ6OBoHyjaRLjTrmmF-J+uA9Da3C8ACuCQC1RFSrIOXaK+Ek3qwmaDho9R0fk2jqFqNISe+HhAA */
  return createMachine(
    {
      id: 'geolocation',
      context: { error: null, position: null, errorCount: 0 },
      preserveActionOrder: true,
      initial: 'initializing',
      states: {
        initializing: {
          always: [
            {
              cond: 'hasSupport',
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
              cond: 'errorThreshold',
              target: 'tracking',
              actions: 'clearError',
            },
          },
        },
        notSupported: { type: 'final' },
      },
    },
    {
      actions: {
        updatePosition,
        updateError: assign({
          error: (_, event) => event.error,
          errorCount: (context) => context.errorCount + 1,
        }),
        clearError: assign({ error: () => null }),
      },
      guards: {
        hasSupport: () => !!navigator.geolocation,
        errorThreshold: (context) => context.errorCount < 5,
      },
      services: { geoService },
    },
  );
}
