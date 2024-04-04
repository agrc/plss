import { assign, createMachine } from 'xstate';
import ky from 'ky';
import DmsCoordinates, { parseDms } from 'dms-conversion';
import {
  countiesInZone,
  createProjectFormData,
  formatDegrees,
  roundAccurately,
} from '../helpers/index.mjs';

export const updateContext = (context, field, value) => {
  if (!field) {
    return context;
  }

  if (!context) {
    return { [field]: value };
  }

  if (context[field]) {
    if (typeof context[field] === 'object') {
      context[field] = Object.assign(context[field], value);
    } else {
      context[field] = value;
    }
  } else {
    context[field] = value;
  }

  return context;
};

export const submissionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOgDN8AnDYrCAGzAGJYAXAQwpYAJVMc8iAbQAMAXUSgADvjwsChCSAAeiAKwAWAOzFVmgJzrDwgByqTe4wBoQAT0QBGAGwBmZ8QBM61e-eP793WF-AF9g615sXHkySmpaBmZ2Th50SIFCQXtxJBBpWXlFFQQNbV0DI1NzK1sHdT13YmFVM013Y01HL2dQ8NT+aPIqYjYICCxCKC4MMHYINnZGADkAUQANABURbKkZLDkiQsRjd3tiPWd1Y2MvDvV3C+s7BCdjNx9hZ3fjx19HHpAIv0iDEhiMxhMpjMRvM2IwAErLADKy02YkUeT2BRyRT0rTO6mEHUcFlUjkc+keDj8DQ0vncJlUej0AWM-0BUWBg2oAGMABb4XYQuYsFAYJZrVHbXK7fYKbFqLQ6fSGAmVYwWSkITQaYjXbV0-zOVT2dRsvockhc4h8gV4IXzUXijaZKUY2WHYqKsoqhlVTU+E7EJz2c72T5OdSOVRmvgWkE8-mCybCx0AIQAggBhADSW3RMqxoCKJSV5VVZnV1Se9k0Ro8wkJ9iuhLMwncMbSA1i1sTduTDrFGZzLvz+QO8s9pWVFQrGpqz1xxiDxhN7gszmE5OcrLCAPN6XjPdt437IrFiOzAEkAAp5nJuwvKBVTsu+yuasN+XUm46aTRNFdXg7IFLW7G0ky4FMxQRZFJVHTFxyLRAfD0INOlrVR1T0Ct3H9ewPh0BthAJfD3F0Zw-l3dkDytcC+0ggdGAAVWvAARdN1mWAB9TMAHlFk4500XvAtEKfZ5TGIdQNyZMlnG1VRnD0f0mlOY09E6Vw-00YC4ytMBCBYMAKBPLg2DoIyKEIeYwC4KATIgLhuQFChwRs2AnTgkSxzlJDJ1LH01TnJ4mW0X96jXCifDqXSaO7AzLNM8zLOsoy7IcpyXLcoyPJWZ0sng90JxLb0Zz9ecw2EVDXkMGTjCqwwdKo-cuyGBLjKSizjNS2z7NoTLKGyuBGCHXNhJ2HyPRK6dy3Kp57lOeptMU9x-0CHdeljOK2sMjqIWS7qbPS-rnMG8Z3JGrNcwK7yEN88TptfIKq0QKNhF1Ywt1WvxHGI9tmq21rqHakz9q6qyjr6xzTtc86cvhJEUTvCa7o9GttHQ+qyRcCwNJe54Q0cHQw0+85IzqTxYqB4gQc6lKjroeY9hQCAmDyryUaKvyTQJM4-2uOoG0+7dNTqVC9DbI0fE6V5ySpzl4t20HJgOiG0sZuQRVZy7h3G6VJonE0lOIYkNE3bCww0VRNUca562wy5PjJY4Nr3QGFZ2xKwfp9Wma1pgYKRvWHzEoonE+INCS8XFyW8Gsbc3DwLmZCWAMUprNs7D3gaVunDvVogoGZ7X2eR-XUeKr0ZrfYKHBDbQ1zaD4GzIgkM7drPQM9vaVfBnquDoQvi6YUay5D+7iyrp7Z3x+Sl3UewTkUiX7lk9vqOp2nvfz2zB4mYeEdgsfRIn5C20aS4Vw3Qx6Ql-GTS-ReLEX9pLnueWu5zr3e592ywDoOgWBJCwHwP1XkYAsBQF5CwTyx8Dbc3uKUQk+hsKrU+NbCqwYTYEhcK0I0GhXYb2zjTXO281Z-wAUAkBYCIFQJgaXG6nNHxh0+A0fwrQ2xVWcDzTQH5pINDbLoFwZFTB-lNADTuh4t4-x3lwf+gDgGgMcuAyB0CdZjVdCfD0xx3pRnuDcBexEggfhNKoYg3DPCblWkSdeLViHSLMn3I68iqFKK4Couhh8g6aPgeJUipwgjEhrN4Dcq1lKYJDOYpsi8n6fT8LY92n9iAoEkIPEYplJD8hYDIWBwctGGyMHzTQAtU7C3vtw0ogFVqGJeAkyRVoUlpPBJMTJ+BskeVHnk3xLCAhBj-KRVamEwwfhOG4H4+FXAaT+gED+h5Gn4HSRCVp7T1EjlulzPxng3D1SNIvKMG5frqE1O0ImWlWg3DniuWZDTUkLOaVwZZOTA4c3LhssOfhFqy3qpoLQSleGYNcEGcmgRpZ3HEZnECh4KBgAAG5YDAAAdxPKsrpFcEHyUIn+Jk3haxkRGVGE2QRpKblMGuaMEjIVWmhXCxFyLR6MNecwhwiDMUoJxegj8FFUKkgDAvI0f1-oQr0t2eZizJhgCUDgOQSyICkFyT4tFfjCm4mKYYUpLh76mCJkEtsIYKIfFttckVtyxVyMlawDJsqvEvPHmjPwS4wxtF0CafCV8Px-iJicFwBJ7hL2KUa7uytjrQyynDYapdUVvOZRilobK0F4vnLWImIYGx1BXB0HlAav492DQNWGPUOlXTgYqooOiTYhIMfhEimp-wNE+poJ+lx0L+opcKwNpkoZ5qGh5Z5xao3PE4ZHckPwF4KQMDbQMSkyJmB+K0DCWaSHfwHkPf28rCpMueMq-maqhYao-BYYgf4zYt2KZ0ReC6HF7yLquzpCr+1NiaNgxk9wgntE8PupcR6CQns+gvQVHdKWKyXRrA+Ea70bofUTeooj2FGkAv6Mwh7mgSwCE2V4LahXbWzUGkDN6i2Rog-VMxnRn1cqbOclSTITYNoratIITQL2kMmLhlmAdEY2vydzCw89G432uIuf580hb1iqh8Gxf5GNLpcYomhqj6ESj7Ru44i0LhXBuJ0fR7rxa-NPbq145LMObyY3IyhMnlG0LUbe9dodo1IKxag3FGD5qIbHUEY0Vw56SZzdJ6h5m5PWsUzZgdgZAnMn1KEikFVFJnEUlwn4FSsazMkBQfAAArMA3JpVQBoPQJgsEeK8V4nCVil5FgcSRIF0+zxfBhQsJGdGvg2z+ijETV+1wKKRlcIQuxJBktpYy1lnLCR8t8SKyVsrnFERrKYUFvZtXrjxNaL9XC85BlLleJuGdHX5JJZS+lzLJ5iB9f21l3NMMhqMAgEQMANBCAwvwAAaxu8dgbwbKto0jEuJaYZ8L810Ct5zj7frMjIr9I0GlKKGeBC9g7Ewjt7YGx2jK52w2MGMiligR2NZWhh9wKG72Jz0m3FJKxv7WyKXsAh7whEKLnK9TLXb-XYfZdx0jk6oaeqMEzOmRYmZlgABkCfc2XuWlwDZl6RlrM14iuoDAXCXopEjjOTuHecnd4yp2UcFq4NkyCGWsAYHMnr+yYBhpXcIDd8Y92nvWiIDCjXmYOfuXWPgVi+vDd0DdybuAQvxJE-nqTkj4vuH+nqqhfCZItCkgMH9ZXiO4dq-t5wUyWv3I6-wHr7kBujes29x5dHlAsfzFonbh3Tucou7d1nj3XvoU+4I0F-3JOfhk+D5T1b-4lzGltiyGJ3RW0HlZwn0vyeISp5yunzP2e6DG7rx5bnvOBe+7DiLlrG4mhKUl84f0-5WtmBNMyLwnWDMAbjEP7LrNLLYEIKZAAXtdy713bvW5uwARxQMZGwAAxSgjuUCGRsGX2QhDHUF1G3EwmVAbQ+H9CmXMTwRaxiS8Eh1P0HwR2Z2IEv2MmvzvwfwL0x1SWL27Hf0-x-woD-wAKAIQF8BNBJ3VBMFtiuFtlD2i33xAO3B+XOTj3QMwKoHGBwIty5x5z50FwbyqxQmqmuCcBnRjj-BgJMHMWZF-RiRrH-SIV6zQMG1QG5G5DgFgFIBQAARsC4GIJMkgC4EGEyn-xYBsEfwt2f0exuxgBYAAC1rtKDadGgG0-BBZiJ6gnNkIzBiMqpF5SQPhGQyQuDNCUBtDdD9DDDjCP9TDHILDnIrCbC8Ci8WArQnDXCLd3DyRPDgwfCKZ-CEALFw8txuEF5rhVpIjDstCdDcA4i6AjCTD4VkjKBLCADBDF8RDwMgsPDGxvDU4SjQ9DApIplGxWhSU6i4cuR5hc1oVUALIPJzdLc7sHD4x5g4Q4ADCWBYBKC2htAJYOso5-x-xt95xuFzggw2hfB1Qmw7g6lIVz8ti8cMoli9j88KAMdMirR5iWAdjlj9jDj2gzgDU24tBCRoCrjQkTYrgAgIcNBcRZjssAS7IwB8B7I2BMksBuQuBPiVjGB3CF4dB9F5JSjXAyRsEJZcQpC6hniz8NDDs1jD51h0w4QONuk64vBD1pIZ0zYyIfkd8G1zF5IQiOgsJ2gF1qV4UkUJg111kN0cFZd1JikGw-B6g+EVxdRaxRNHjbZwUUDqZZTaUFTlg4Q4QitKD8Imw+YIoG0KIowmw+EfkxS6Cax1RPBrgF01C5EfjKAUV+iqtDRuVMJWxiQfB9RXTQCut6gkDXATBxFdxCB8BWZ4Acg1DrMqsABaDSTUHMzwRoIiW2RkVSckLQLNbMj0NcG2UAmOY0MicOA5ZAtQw8eIMAaswnA9MwJSDcDbT4Y4D8H4ImQkMLFvERMMBdMEUyaYWYGELsvyeobZKqeoJoJkVNYc4kMkjcYJPUdUI0ts2iXsUyKCRcvxeqRoLrTCLQCZf8I5VbJwd6S4YiCiX8RqLzINVWfuTtcfOAc8ooWQiqMiNwOoO4MkRsJ01QnrKRYzb8hmP2VjAChwHlXUbwZsZclUAHV6FwDwAIO4Xw22apT8vOchZdfef2ZC6rMxeqekckEwfVGsB86sdzIMKtEMH7dUQ1AfIzJdeCtKHzNxDxaBKi5c3UVc+kRkEYkxDoDwCwOdZociE-I841JpDJLJGQKigIH4NCtoMPfRG+ExCWW40s+SKPJwGU2FOUk8LSoIU4B9JkScis8JasVhXUERDQb1SMZoBdUVe5CVKVS1UgLS1C0lDCgyu4D8V4NwQmAwGWZcqcni+xYzX88vf8pUoLJaKSQIwxekdoV4G2YpOAtcX5OOW8kiiEK9YeEKy8rQbGbcRBAwfGUZKSVwRkY0F1Y0WsCq5jRC1mLSxQ8S-VBtDSJwE4FSAlaJdfOoKQj4HqkzBRXzdxCzFgUSzCW47hfCz4JkT4PCd6c4cHDqheLq-vKHdQpnLLKinMy4f0bhXRI0ZUb0kCxk1Ai6w7DsrSl4dykq0wT0nBHfQkcxffGao-FwZSmC148-M7NKrSi4jwOSJsAy-ChDNcYsh2aOBy1E23dXUfSYP82ASfVmavHPMAPPLSiszw22YkC4fQDQZrKjQ0k0bUQkbcPQLGng7AiEe-C3KirZWM4iWsdg44ZoUPDcYs3fKMIRGsLGho2IgwlohIjqMwlI-ANIqi1oUW04fQdoZoACTcSspK86lXOY2IBYztQk-Yqi4QTUVhMxJwQWl1Gol66IV49EmALEigHE3kPEgk3YlYq2m21UW44iUkaop49m67USyJe2jc-QbhdodveaYkVCKWFm84l88GxJeHN6uHaFE7SAXmhOqJGWThfQNsQTZCJSVCakCk-BW030nrf0jHT614eE2sfTYiFcfwD8XQUAysT6W08uncUIIAA */
  createMachine(
    {
      preserveActionOrder: true,
      id: 'submission',
      type: 'parallel',
      states: {
        form: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'start submission': [
                  {
                    target: 'adding metadata',
                    cond: 'is new submission',
                  },
                  {
                    target: 'uploading existing pdf',
                    cond: 'is existing submission',
                  },
                ],
              },
            },
            'adding metadata': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'choosing datum',
                },
                RESET: {},
              },
            },
            'choosing datum': {
              exit: 'saveToContext',
              on: {
                NEXT: [
                  {
                    target: 'entering grid coordinates',
                    cond: 'is grid datum',
                  },
                  {
                    target: 'entering latitude',
                    cond: 'is geographic datum',
                  },
                ],
                BACK: [
                  {
                    target: 'adding metadata',
                    cond: 'is new submission',
                  },
                  {
                    target: 'uploading existing pdf',
                    cond: 'is existing submission',
                  },
                ],
                SKIP: {
                  target: 'reviewing',
                  cond: 'is existing submission',
                },
                RESET: {},
                UPDATE_CONTEXT: {
                  target: 'choosing datum',
                  internal: false,
                },
              },
            },
            'entering alternate grid coordinates': {
              exit: 'saveToContext',
              on: {
                NEXT: [
                  {
                    target: 'uploading photos',
                    cond: 'is new submission',
                  },
                  {
                    target: 'reviewing',
                    cond: 'is existing submission',
                  },
                ],
                BACK: [
                  {
                    target: 'entering ellipsoid height',
                    cond: 'is geographic datum',
                  },
                  {
                    target: 'entering grid coordinates',
                    cond: 'is grid datum',
                  },
                ],
                RESET: {},
              },
            },
            'entering alternate latitude': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'entering alternate longitude',
                },
                BACK: {
                  target: 'entering grid coordinates',
                },
                RESET: {},
              },
            },
            'entering alternate longitude': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'entering alternate ellipsoid height',
                },
                BACK: {
                  target: 'entering alternate latitude',
                },
                RESET: {},
              },
            },
            'entering alternate ellipsoid height': {
              exit: 'saveToContext',
              on: {
                NEXT: [
                  {
                    target: 'uploading photos',
                    cond: 'is new submission',
                  },
                  {
                    target: 'reviewing',
                    cond: 'is existing submission',
                  },
                ],
                BACK: {
                  target: 'entering alternate longitude',
                },
                RESET: {},
              },
            },
            'uploading photos': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'reviewing',
                },
                BACK: [
                  {
                    target: 'entering alternate ellipsoid height',
                    cond: 'is grid datum',
                  },
                  {
                    target: 'entering alternate grid coordinates',
                    cond: 'is geographic datum',
                  },
                ],
                RESET: {},
              },
            },
            reviewing: {
              on: {
                NEXT: {
                  target: 'idle',
                },
                ERROR: {
                  target: 'submission error',
                },
                BACK: [
                  {
                    target: 'uploading photos',
                    cond: 'is new submission',
                  },
                  {
                    target: 'uploading existing pdf',
                    cond: 'is existing submission',
                  },
                ],
              },
            },
            'uploading existing pdf': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'choosing datum',
                },
                RESET: {},
              },
            },
            'entering grid coordinates': {
              exit: ['saveToContext', 'clearGeographicCoordinates'],
              on: {
                NEXT: {
                  target: 'entering alternate latitude',
                },
                BACK: {
                  target: 'choosing datum',
                },
                RESET: {},
              },
            },
            'entering longitude': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'entering ellipsoid height',
                },
                BACK: {
                  target: 'entering latitude',
                },
              },
            },
            'entering latitude': {
              exit: ['saveToContext', 'clearGridCoordinates'],
              on: {
                NEXT: {
                  target: 'entering longitude',
                },
                BACK: {
                  target: 'choosing datum',
                },
                RESET: {},
              },
            },
            'entering ellipsoid height': {
              exit: 'saveToContext',
              on: {
                NEXT: {
                  target: 'entering alternate grid coordinates',
                },
                BACK: {
                  target: 'entering longitude',
                },
                RESET: {},
              },
            },
            'submission error': {
              on: {
                BACK: {
                  target: 'reviewing',
                },
              },
            },
          },
        },
        projecting: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_COORDINATES: [
                  {
                    target: 'projecting grid coordinate',
                    cond: 'is grid datum',
                  },
                  {
                    target: 'converting coordinates to decimal degrees',
                    cond: 'is geographic datum',
                  },
                ],
              },
            },
            'projecting grid coordinate': {
              invoke: {
                src: (context) => {
                  const formData = new FormData();

                  Object.entries(
                    createProjectFormData({
                      type: 'grid',
                      coordinates: context.grid,
                    }),
                  ).forEach(([key, value]) => {
                    formData.append(key, value);
                  });

                  return ky
                    .post('project', {
                      body: formData,
                      prefixUrl:
                        'https://mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer',
                    })
                    .json();
                },
                id: 'project grid',
                onDone: [
                  {
                    target: 'format grid results',
                    actions: assign({
                      decimalDegrees: (_, event) => event.data.geometries[0],
                    }),
                  },
                ],
                onError: [
                  {
                    target: 'rejected',
                  },
                ],
              },
              on: {
                CANCEL: {
                  target: 'idle',
                },
              },
            },
            'converting coordinates to decimal degrees': {
              invoke: {
                src: (context) =>
                  new Promise((resolve) => {
                    const dms = [
                      `${formatDegrees(context.geographic.northing)} N`,
                      `${formatDegrees(context.geographic.easting)} W`,
                    ];

                    const [y, x] = dms.map(parseDms);

                    resolve({ x, y });
                  }),
                id: 'convertCoordinatesToDecimalDegrees',
                onDone: [
                  {
                    target: 'determining zone',
                    actions: assign({
                      decimalDegrees: (_, event) => event.data,
                    }),
                  },
                ],
                onError: [
                  {
                    target: 'rejected',
                  },
                ],
              },
              on: {
                CANCEL: {
                  target: 'idle',
                },
              },
            },
            'determining zone': {
              invoke: {
                src: (context) => {
                  const formData = new FormData();
                  formData.append(
                    'geometry',
                    `${context.decimalDegrees.x}, ${context.decimalDegrees.y}`,
                  );
                  formData.append('geometryType', 'esriGeometryPoint');
                  formData.append('outFields', 'NAME');
                  formData.append('spatialRel', 'esriSpatialRelIntersects');
                  formData.append('returnGeometry', false);
                  formData.append('inSR', '6318');
                  formData.append('f', 'json');

                  return ky
                    .post('query', {
                      body: formData,
                      prefixUrl:
                        'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahCountyBoundaries/FeatureServer/0',
                    })
                    .json();
                },
                id: 'queryForCounty',
                onDone: [
                  {
                    target: 'successfully queried for county',
                    actions: assign({
                      zone: (_, event) => {
                        if ((event.data?.features?.length ?? 0) < 1) {
                          return '';
                        }

                        const county =
                          event.data.features[0].attributes[
                            'NAME'
                          ]?.toLowerCase();

                        let zone;

                        Object.keys(countiesInZone).forEach((key) => {
                          if (countiesInZone[key].includes(county)) {
                            zone = key;
                          }
                        });

                        return zone;
                      },
                    }),
                  },
                ],
                onError: [
                  {
                    target: 'rejected',
                  },
                ],
              },
              on: {
                CANCEL: {
                  target: 'idle',
                },
              },
            },
            'successfully queried for county': {
              invoke: {
                src: (context) => {
                  const formData = new FormData();

                  Object.entries(
                    createProjectFormData({
                      type: 'geographic',
                      coordinates: {
                        zone: context.zone,
                        x: context.decimalDegrees.x,
                        y: context.decimalDegrees.y,
                      },
                    }),
                  ).forEach(([key, value]) => {
                    formData.append(key, value);
                  });

                  return ky
                    .post('project', {
                      body: formData,
                      prefixUrl:
                        'https://mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer',
                    })
                    .json();
                },
                id: 'getZone',
                onDone: [
                  {
                    target: 'format geographic results',
                    actions: assign({
                      statePlane: (_, event) => event.data.geometries[0],
                    }),
                  },
                ],
                onError: [
                  {
                    target: 'rejected',
                  },
                ],
              },
              on: {
                CANCEL: {
                  target: 'idle',
                },
              },
            },
            'format grid results': {
              invoke: {
                src: (context) =>
                  new Promise((resolve) => {
                    const dmsCoords = new DmsCoordinates(
                      context.decimalDegrees.y,
                      context.decimalDegrees.x,
                    );

                    resolve(dmsCoords.dmsArrays);
                  }),
                id: 'formatResults',
                onDone: [
                  {
                    target: 'done',
                    actions: assign((context, event) => {
                      context.geographic = { northing: {}, easting: {} };
                      const { longitude, latitude } = event.data;

                      delete context.decimalDegrees;

                      context.geographic.northing = {
                        degrees: latitude[0],
                        minutes: latitude[1],
                        seconds: roundAccurately(latitude[2], 5),
                      };
                      context.geographic.easting = {
                        degrees: longitude[0],
                        minutes: longitude[1],
                        seconds: roundAccurately(longitude[2], 5),
                      };

                      return context;
                    }),
                  },
                ],
                onError: [
                  {
                    target: 'rejected',
                  },
                ],
              },
            },
            'format geographic results': {
              always: {
                target: 'done',
                actions: assign((context) => {
                  const { x, y } = context.statePlane;
                  context.grid = {
                    zone: context.zone,
                    unit: 'm',
                    easting: roundAccurately(x, 3),
                    northing: roundAccurately(y, 3),
                  };

                  delete context.decimalDegrees;
                  delete context.statePlane;
                  delete context.zone;

                  return context;
                }),
              },
            },
            done: {
              type: 'final',
              on: {
                RESTART: {
                  target: 'idle',
                },
              },
            },
            rejected: {},
          },
        },
      },
    },
    {
      actions: {
        saveToContext: assign((context, event) => {
          context = updateContext(context, event.meta, event.payload);

          return context;
        }),
        clearGeographicCoordinates: assign((context) => {
          delete context.geographic;

          return context;
        }),
        clearGridCoordinates: assign((context) => {
          delete context.grid;

          return context;
        }),
      },
      guards: {
        'is new submission': (context) => context.type === 'new',
        'is existing submission': (context) => context.type === 'existing',
        'is grid datum': (context) => context.datum.split('-')[0] === 'grid',
        'is geographic datum': (context) =>
          context.datum.split('-')[0] === 'geographic',
      },
    },
  );
