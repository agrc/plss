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
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOgDN8AnDYrCAGzAGJYAXAQwpYAJVMc8iAbQAMAXUSgADvjwsChCSAAeiAKwAWAOzFVmgJzrDwgByqTe4wBoQAT0QBGAGwBmZ8QBM61e-eP793WF-AF9g615sXHkySmpaBmZ2Th50SIFCQXtxJBBpWXlFFQQNbV0DI1NzK1sHdT13YmFVM013Y01HL2dQ8NT+aPIqYjYICCxCKC4MMHYINnZGADkAUQANABURbKkZLDkiQsRjd3tiPWd1Y2MvDvV3C+s7BCdjNx9hZ3fjx19HHpAIv0iDEhiMxhMpjMRvM2IwAErLADKy02YkUeT2BRyRT0rTO6mEHUcFlUjkc+keDj8DQ0vncJlUej0AWM-0BUWBg2oAGMABb4XYQuYsFAYJZrVHbXK7fYKbFqLQ6fSGAmVYwWSkITQaYjXbV0-zOVT2dRsvockhc4h8gV4IXzUXijaZKUY2WHYqKsoqhlVTU+E7EJz2c72T5OdSOVRmvgWkE8-mCybCx0AIQAggBhADSW3RMqxoCKJSV5VVZnV1Se9k0Ro8wkJ9iuhLMwncMbSA1i1sTduTDrFGZzLvz+QO8s9pWVFQrGpqz1xxiDxhN7gszmE5OcrLCAPN6XjPdt437IrFiOzAEkAAp5nJuwvKBVTsu+yuasN+XUm46aTRNFdXg7IFLW7G0ky4FMxQRZFJVHTFxyLRAfD0INOlrVR1T0Ct3H9ewPh0BthAJfD3F0Zw-l3dkDytcC+0ggdGAAVWvAARdN1mWAB9TMAHlFk4500XvAtEKfZ5TGIdQNyZMlnG1VRnD0f0mlOY09E6Vw-00YC4ytMBCBYMAKBPLg2DoIyKEIeYwC4KATIgLhuQFChwRs2AnTgkSxzlJDJ1LH01TnJ4mW0X96jXCifDqXSaO7AzLNM8zLOsoy7IcpyXLcoyPJWZ0sng90JxLb0Zz9ecw2EVDXkMGTjCqwwdKo-cuyGBLjKSizjNS2z7NoTLKGyuBGCHXNhJ2HyPRK6dy3Kp57lOeptMU9x-0CHdeljOK2sMjqIWS7qbPS-rnMG8Z3JGrNcwK7yEN88TptfIKq0QKNhF1Ywt1WvxHGI9tmq21rqHakz9q6qyjr6xzTtc86cvhJEUTvCa7o9GttHQ+qyRcCwNJe54Q0cHQw0+85IzqTxYqB4gQc6lKjroeY9hQCAmDyryUaKvyTQJM4-2uOoG0+7dNTqVC9DbI0fE6V5ySpzl4t20HJgOiG0sZuQRVZy7h3G6VJonE0lOIYkNE3bCww0VRNUca562wy5PjJY4Nr3QGFZ2xKwfp9Wma1pgYKRvWHzEoonE+INCS8XFyW8Gsbc3DwLmZCWAMUprNs7D3gaVunDvVogoGZ7X2eR-XUeKr0ZrfYKHBDbQ1zaD4GzIgkM7drPQM9vaVfBnquDoQvi6YUay5D+7iyrp7Z3x+Sl3UewTkUiX7lk9vqOp2nvfz2zB4mYeEdgsfRIn5C20aS4Vw3Qx6Ql-GTS-ReLEX9pLnueWu5zr3e592ywDoOgWBJCwHwP1XkYAsBQF5CwTyx8Dbc3uKUQk+hsKrU+NbCqwYTYEhcK0I0GhXYb2zjTXO281Z-wAUAkBYCIFQJgaPYOJ8PTHHelGe4NwF7ESCB+E0qhiDOEXjg1aRJ14tWIVvH+O8uD-0AcA0BjlwGQOgYfIOromGGzbKcIIxIazeA3KtZSmCQz8KbIvJ+n0-CiPdp-YgKBJCDxGKZSQ-IWAyFgYw+B4kebvVxJoAWqdhb3wEaUQCq1OEvCsZ3Q8diHHgkmM4-AriPIMLUZ4sOAi+Ho1IqtTCYYPwnDcD8fCrgNJ-QCB-aJ9j8COIhAkpJOtrqpIrgg6SuoPjGl8IpTcxFNTtCJlpVoNw54rgqVaGJ1S4lcDqW4wOHNy5cy8X4Rast6qaC0EpTQPDXBBnJoEaWdxTQAyiVaCgYAABuWAwAAHcTwNLgc0rxiDCJ-iZN4WsZF8lRhNkEaSm5TBrmjEckCh5TkXOubc0eN1OaPjDk8loKC3noI-BRVCpIAwLyNH9f6mdgVjKqTUyYYAlA4DkLUiApB3FNIWWHIwfM-GGACS4e+pgiY6M0ecX6FFCFiJseMgl0jiWsCceSlRczx5oz8EuMMbRdAmnwlfD8f4iYnBcASe4S8-GjMVt-Y60Mspw2GqXDxDzYXyWeQitBHz5y1iJiGBsdQVwdDRVq7uytdUDVhj1ZJV17nUqOPSE2eiOH4RIpqf8DRPqaCfpcdCmqgV6W1T3d1MMhoeVmb6mFDg2zvXwuSH4C8FIGBtoGJSZEzA-FaBhF1X8k17yLv7SlhVM3PFpb4-xQsmUfgsMQP8ZsW5+M6IvatJCdV1oPikptocHD1T4Z0Rk9wdHtE8F2pcvaCT9s+gvbFHdcWJrdRrA+RqqXNqbIneopgo01iNIBf0Zge3NAlgEJsrw404oTa60yB6G0Ttun6iSTRsHzpRU2QZKkmQmyjUG1aQQmjDokQPP2LMA6IzFeo7mFh56NxvtcRcmz5z0hMPWKqHwRF-jg6QwllC5E0KUTAo9k7T4IGOItC4VwbidHYYq8W6yB2aNeICt920a1upkVQ+RXBFF0Lucav9i8zXwteZajB8072FqCMaK4c9yM6tE9RhRtDlHppkyezRjQnDMn1PoikFVFJnC6RyhafjNwVMkBQfAAArMA3JSVQBoPQJgsEeK8V4nCVil5FgcSRBmqdzxfBhQsJGdGvg2z+ijETV+1wKKRlcNy6xxBXMea8z5vzCRAt8RC2FiLnFEQjl-SeuLuoEuWNaL9XC+HtRLleJuctWX5Iubc557zJ58sDaK6ZKGHqhqMAgEQMANBCBnPwAAazmwVwb3AobRcYw-JcS0wz4X5roNrKmAO-WZGRTljIyT9cK0NiYI3bs+eTfqnqjBjJuYoPljWVo1tFd1Vtj09JtxSU3G0OdDZFL2Fvd4QiFFBkqpljd9bw3ft3cmBNlNBrGCZnTIsTMywAAyAPDbL0DS4CHSlIy1lS8RRr0k7gBEUnOpHY37vOQW8ZJ7mOvVcFcZBLzWAMDmX5-ZMAw0ZuEDm+MRbK3rREDOZzzML33LrHwKxAXQu6Dq9F3AYnfkgfz1B5u1skP-T1VQrm9CpIDB-RZ2juXHPOCmW5+5Xn+B+fckF8L1mOuPLvcoF9+YtF5eK+VzlVX6vPea+16c3XxmYsG5Bz8Y3FOoftcI8aW2LIzHdHjQeVHxX2cK6dxCF3OU3ce693QEXsePI47x4TvXXjSdpY3E0SnW5-T-nS2YE0zIvDZYEzuuMBfhus0stgQgpkABes3puzfmzLubABHFAxkbAADFKBK5QIZGwTeignAMLqbcmFlRRo+P6Up-C8FpbMV4Signoij-u+P4yk+Z9z-959+xQfuyr-Xy3woB3z3wP2Qj8HUBB3VBMFtiuFtjN1s17xDGklfkGTt2KzfyoHGE-0l2x1x3xyJ3j0YxQmqmuCcHLRjj-Cv0IyUibEHROBrG3SIRIBf181QG5G5DgFgFIBQAARsC4AAJMkgC4EGEyl3xYBsHn0l0X2WzmxgBYAAC1ZswCEA4dGgo0IDU4KZlNkIzBZ0qpF5SR2kNJH9h989Rt7d2DODcAeC+CBC18hDHJRDnJxDJDv9A8WArR5ClDJcVC1DGxND7V6gdDVCn40JawBEF5rhVp0DhsrCuDbC6B+DBDLknDKAxC988CG9CDj0Yt-CNC+8girV5oBYpJSlGxWh-lYj7suR5guBTlUALIPIJcpcFtZD4x5g4Q4BeCWBYAVD-wpUQxXhtxXg5M095pY4e0YMMUyRAhIlgVWCOjuAGiei-cKAPsPCrRaiWAujGjej+jCN-B1wRiBEFp-RtxID-Arg1lTAVwGpqjfMWipC5tWAbJiBmCHtkdX9lCiC0ZiJlU-xtxPBVlyZUtwMjQSkrgNINJtRQhdxCB8BWZ4AcgPirR4gwAGNAdu0zAlINwutPhjgPwfgiZCQLNk8yIr5h0wRTJphZgYRMSJx6g3Bzd6gmgmR7UiTiQdB7gggOstB1RDkn9iE6JTIoIGTuZ6pGgctMItBil-x1A8JfopJ6ppJbYwktBtMk1VZ+4Mcw84BxTxIqCKoyI3A6g7gyRGwKIfhNS3VtSGZENWYDSw40VdRvBmwmSVRjtXoXAPAAg7hiI8YwkbS85yEB4h5-YnSHAyI2l6RyQTAKJeSFSbMmwgwQ0Qx9t1RbZgyyF+5dNqF9NaNIyEAmS2kmR6RGQtCeEOgPALBK1mhyIh9UTuw+VJlplkToUYsAgfhXS2hzd2Eb4eEJYgxfBTB5ItBM9h1QVLkbkJgiz8J-BlwqpgiVxyQ6hkUfBdQKSNBVVIxmhh0WzTIiUSVhVSA5yXT-l3T+y7gPxhigxoTyZ1QFpc8hSbF4NdSzovUiylopI9DOF6R2hXgbY-Eb81x1k45ZTszJgx0Iy6tOzMJ3otBsYgT5IDB8YCkpJXBGRjQ5VjRaxIKENNYkM5zmROsPhfoo0NInATgVIvlTE286hyCPh8K8zxNJNoEvzMJhyBE-TPgmRPg8IfFMKLYcKr1q0iy1wbZICY5tyVwWQJZGyeVPjWdfN0S5yXhNzQLTAaxrhNwu9CR+Fe8GKB8XAFK8tFjWDnsPybI5z-w3g5Imx+y-Tb01xGgqoNBo5T09AHiHdi8uc9TYAK9WYo9vcwBfc5zVz1DbZiQLh9ANAwTUJbYF5xzCRtwvK89n8LCMCZh39sCIRZ9JdxL6d+FiIIiAKy0zcNxXLu8oxdBLFvL4ibDeCkj7COphDnD8BXCizWgKrTh9B2hmgAJNwNT0rgRFjtj6juimiiyzYL4PhRjTiF1b0AMOgMIukMVcsolFiWivzjEnAUFSSBF2hxjwDwTvAUr-wbjYMRqWDMrhtTl1tIBxKjqTEZZs19A2w8N5olIEq5NtR8F5yHjCr-QAUdl1UVS2FnNrqiyABaZdecWGtwJkJG5G5GpqUIIAA */
  createMachine(
    {
      preserveActionOrder: true,
      predictableActionArguments: true,
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
              exit: 'submit',
              on: {
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
                    })
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
                    `${context.decimalDegrees.x}, ${context.decimalDegrees.y}`
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
                    })
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
                      context.decimalDegrees.x
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
              always: [
                {
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
              ],
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
    }
  );
