// @ts-check

import DmsCoordinates, { parseDms } from 'dms-conversion';
import ky from 'ky';
import { assign, fromPromise, setup } from 'xstate';
import {
  countiesInZone,
  createProjectFormData,
  formatDegrees,
  roundAccurately,
} from '../../../functions/shared/index.js';

const client = ky.extend({
  timeout: 40000,
  retry: 3,
});

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

const project = (grid) => {
  const formData = new FormData();

  const data = createProjectFormData({
    type: 'grid',
    coordinates: grid,
  });

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return client
    .post('project', {
      body: formData,
      prefixUrl: 'https://mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer',
    })
    .json();
};

const coordinateToDecimalDegrees = (geographic) => {
  return new Promise((resolve) => {
    const dms = [`${formatDegrees(geographic.northing)} N`, `${formatDegrees(geographic.easting)} W`];

    const [y, x] = dms.map(parseDms);

    resolve({ x, y });
  });
};

const queryForCounty = (decimalDegrees) => {
  const formData = new FormData();
  formData.append('geometry', `${decimalDegrees.x}, ${decimalDegrees.y}`);
  formData.append('geometryType', 'esriGeometryPoint');
  formData.append('outFields', 'NAME');
  formData.append('spatialRel', 'esriSpatialRelIntersects');
  formData.append('returnGeometry', 'false');
  formData.append('inSR', '6318');
  formData.append('f', 'json');

  return client
    .post('query', {
      body: formData,
      prefixUrl:
        'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahCountyBoundaries/FeatureServer/0',
    })
    .json();
};

const projectToStatePlane = (coordinates) => {
  const formData = new FormData();

  Object.entries(
    createProjectFormData({
      type: 'geographic',
      coordinates: {
        zone: coordinates.zone,
        x: coordinates.decimalDegrees.x,
        y: coordinates.decimalDegrees.y,
      },
    }),
  ).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return client
    .post('project', {
      body: formData,
      prefixUrl: 'https://mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer',
    })
    .json();
};

export const submissionMachine = setup({
  actions: {
    saveToContext: assign(({ context, event }) => {
      context = updateContext(context, event.meta, event.payload);

      return context;
    }),
    clearDatum: assign(({ context }) => {
      delete context.datum;

      return context;
    }),
    clearGeographicCoordinates: assign(({ context }) => {
      delete context.geographic;

      return context;
    }),
    clearGridCoordinates: assign(({ context }) => {
      delete context.grid;

      return context;
    }),
  },
  guards: {
    'is new submission': ({ context }) => context.type === 'new',
    'is existing submission': ({ context }) => context.type === 'existing',
    'is grid datum': ({ context }) => context.datum.split('-')[0] === 'grid',
    'is geographic datum': ({ context }) => context.datum.split('-')[0] === 'geographic',
  },
  actors: {
    project: fromPromise(({ input }) => project(input)),
    coordinateToDecimalDegrees: fromPromise(({ input }) => coordinateToDecimalDegrees(input)),
    queryForCounty: fromPromise(({ input }) => queryForCounty(input)),
    projectToStatePlane: fromPromise(({ input }) =>
      projectToStatePlane({
        decimalDegrees: input.decimalDegrees,
        zone: input.zone,
      }),
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOgDN8AnDYrCAGzAGJYAXAQwpYAJVMc8iAbQAMAXUSgADvjwsChCSAAeiAKwAOVcQCMqgGwAmPeoOrtu-QBoQAT0TrhAFmIB2RwE5P+9wGYD7-wBfQOtebFx5MkpqWgZmdk4edHCBQkFtcSQQaVl5RRUEDS1dQ2NTc1UrW3tK4lNhYW0XVUd1Nsdg0OT+SPIqYjYICCxCKC4MMHYINnZGADkAUQANABURTKkZLDkifPsTHT1HYT09YQC9dzbrOwQj92J3Dy9HbQN1Rx8XTpAwnqIov1BsNRuNJoMZmxGAAlBYAZQWazEihy2zyWQK2mEqh8xD0fhMLhcnncwneN0Q+OcDRpel0Pj0Lh8Pz+EQBfWoAGMABb4Lag6YsFAYebLJEbbJbHYKDFqTQ6fRGExmCx6CkIbRfbR4s7qbRHJyvDQs7pskgc4g8vl4AUzYWi1bpCWo6V7QrykpK8qq9UGFzatyeJlfMnqI4mvhmwFc3n8saC+0AIQAggBhADS6xRUvRoAKRQVpWVFSqtxcDWIjlUDSaSs+jm+IV+ptS0ctsZt8btIpTGad2dyu1l7uKirKKsqauqhU1dWe7lUBlM6iJqgjKV60Xb1pGXaFIrh6YAkgAFLNZF255Ry0dF72T9XuXSPRxHHxvdTuJnvdf-c1bq04y4BMRVhBFxQHNEhzzRAlz0PFWk+OlNB8T4DB8dU3n0R5dWxbFVCeU5fyjC1AM7YDu0YABVE8ABFkxWBYAH1UwAeTmRjHWRC8c2g68NQcPEFz8FpHAMMTy3UTCDBOSszhcdQ-AaHxKjXJtWVbC0wEIFgwAoXcuDYOhdIoQgZjALgoH0iAuE5PkKBBczYAdCCeMHGUYJHQsvQnUtYIMJoEM+MxGnaNxiM0rdtJMgyjJMszdMs6zbPsxzdOcxZHQySDXWHAtPXHEsp1ucxjErV8WmxRljHUCLN36aK9Ni4y9ISiyrNoFLKDSuBGF7TNuM2dy3Xysdix9adxO0ZwfCeV5hBXU5GWZdSW3q6hGv00E4ta8yks6uzupGJy+rTTNsrcqCPP40a7184rEF0dDDgWvUv3MNpGy6SNIoanSmu2lrTL2jqbMOhzjvSmF4URc8hqut0mng5TSU0T9xJcAxfR8YRcV8RoFNUYkrlxur2Si-6trGHbgcSugZm2FAICYTLXPh3LPNunyiswr94OmtCn3xUw9DU76N3Jv6YsB+K9vpuQhWZ06+0GyVhryj0xvvPyNTEgwXsUkwzgaYwyf-KWAepoG2q4eXGaVsDYdVy8+IKGSXGIAlNQcWby3cB6BMuR4nlMNx30-MXmx+9biE25rZbpogoHtlmxThtWEeHNp9f1Y5TnOIwrik6dtD1YozgCfQTBDPQzbbOOZd2xPRhT5WBudXjroKNptTzv0Pg+DQl150wgpxplhBcU5KjrrTKfjpuLLoJPW8dtmM45-isWJSsicafECLpYxMI+B4jjEjQvin14VvFv96-nxvaYssA6DoLBJFgfBOu5MAsCgbkLAXLpxdl3G83lCoTRKgFdQL5RaGDEn4Yk2hZ4U2llbBOL834fy-j-P+ACgGs37JdTe+ZNZ3R5iXcwHtCJmBXG8c4X0o4S3NhtR+GDF5cFfu-T+38bK-3-oAtuIDO4jXIdzKBj1r46nOLjI2RIFyoItlTQy1s9rcJwXwrgAiCHQ3AiI9WnlS7CGILjN4RoVKmE+JhSSwdPhYiOARceSjqAoEkMvQYBlJC8hYDIYBztRHDieiYgIpcjjvD1A4YuJVJ4expJPGBCkj4uOIG4jxIIxjePwL45y-UDGZyMT4FceJiSi2rvSHwGES5vkeFidGn4GliRSWk-AnjQRZJycIi67MryYnfNqUOmhsQKS-C4X05x4KfnrA0J82IDDNPca0jJXAOl+LXvk0hj1Lj61micUwXgikeEwvoLQ80PizWMAuTwKSKBgAAG5YDAAAd13P4juhj+LZ0OHnCuhdrjTn9vBRwr4qzvlBehdwNz7mPJeaMRgCxoTQlYtCDZvT7D+mIJ+E41ZRbEgaGMku+84ENmrDM6akLVrR0ltQW5DznmvLyQEj5fSyQ6AXP4Wa4dtmYTJPBUleFKlLnLLXSlLC2y0phQys6xCemu0ejjHO7LfC+DCQER8U9TE0neA2U4xJI4aRji0tpYwwBKBwHIdpEBSBvJymijUi4QkwPCT3KJ6pZr63nB8fwUTtAUrviRLcRrlmmvNV4q1einbvIKVvS4NCcSajODJc4Gh1QKLnJ4YwyFND+xSQ3MYoMuoQzahlNOTLo3dwOLnE4vzLj-JKg2fW+cwyNAsF+P1zD75z3QftMGqVIa9UZVGzZCAe6Vj2QpRCQ8sYlz8NqfUk8ngtGzg2XN7Ce2Fp6s5dZZbh1Yn9i9AWil-DEmifK2aQlcWVJCm4JhBrqWxzXcvFuitU5cSHXa4JjwnViRdQtbGBx+knEUpUJ6t61r3rzbbFeL7hE7o-ZoOJ6EGx6gcb66dtx0IAfMEBlSZhFxgapawh93a7YwaIXBuVAkiauD1EYImpcmQpsmmhTF2HSQBUnp8W+HaA3KIMqRpmTBB22so6XajZJUIKWw3SNVJdqzBwzeJMSHht6rpIwzGD2732UZkue18i13yLmOCuX0-gTEofOMCjwDIOiis7Wgy2XDsG8LwYIwhpbtNgJHZWg0+cLhF2xviTFTwinse3iK-1v02Hdo0S5-h+ChHCZIR+hVbLFzKq5bJjDLGLNhc45UtTjnYu4Pi25iN69QGI3OLifOh6-BttPQgdCRTPYhZk6+cJBGxUWjvYQLhFAKCUFg55sRt4JEPkJYycq9xjAnJOHXSQg2ABWYBOQWqgDQegTBwIsVYsi2iR45gMXhKi0TKlcSVA6wyTGjHGsRIeCLSqDJSTNAW8t1b63NtxB22xfbh3jtwhlRvFLOJiCXdONdv0Kk7ueBMY9j4C0yT6C6-fRb+AVtrd3MQNHGP1vrvBj1RgEAiBgBoIQO5+AADWpOccfZ7adrzuhPyeyQgEAK5RfC+kxiY8+nwmTlhkh8N76OPtY9p5j0EBaCf9sYHpQbFBsfywtOL7goMGdugCkcMHhgzCtAUQuVQvovWuBOZU84pIFrcd69j97EuNsq4MlLvtbVGCpmTHMVMCwAAy6ugmOLqHR8SHwFJT20EblrzRRZic1IhYXuOsd2XJ3pPH0vi1cF8cBVbWAMBGUz1ZMAvVieEFJyMCn1PLREDucn1MzunIrHwLRLPOe6CN-z3AX3nlNfOEVLrlcxNKi+n9g8SolvfX6CjxFnjrYHejAr0nzgBlU9OXT-gTPnJs+5+Zm35ycvKCK5mKRSv1fa-pXr439fzfW+3PbxRrzXftflD1-3w3k02emOrIpAImM91x9F7PxPVeC+oIS+6UK+a+G+dAee1+zkbuHu3uHeMaVYAeosQeyGoeg+56keioS4HWRMv+duxAzMJk2AhABkAAXiTkTiTmTmXqTgAI4oB6Q2AABilANeKAOkNgCBbs3qeITQvqTIdI12BKtws6w+H+lSiklwxw+q4GJAM+G2RBekJB5BlBu+Cu7iB+W4DBTBrBFA7BnB3BsExgzgzQyks0mglwosbq5iX6IkngfoLQ+Bn2ShVAIwqhxeru7unuPut+GuRS+s1YCkVUJwTgVSohWEdh4kOIYkjQThdmUYChxAqAnInIcAsApAKAb8NgXAOh+kkAXAfQKUHBLANgVBxeNBVOpOMALAAAWiTkYQgF8PBLpvqCSP6K0DrP4NhCqJjCgcCqpgkdPrbp9ikWkbgJkdkbkYwfkTZEUXZCUWUeofviwBaDUfUcXo0c0XUGYpcEGNNJYW6ocpinigqkcN7M4VjmMekZMXQDkXkY8nMZQMUZwV4XAb4SNsONsa0Xse9J0QHO+DJJ7LNKjAyLqLZpFpEEkRyDMOurcqgMZM5EXiXuTlUdGDMNCHAFkSwLAI0YTK4KhKFh4EZllrBGGPrL4Odl8C0CHFbnITbiLgQTCarslPCdiTvgNnvpoasVuMyZiQiTiXifKEyJ8FMuyh4OhsYY0K1lZliH6L4EyJcbPsyZZGAPgFZGwN4lgJyFwGyYiYwEKVoCKUSeKaSU1guHytQoHgMZPEqYoZQWBCsMmNCBVoEkYliFoJPGSJjJYcBoPuWJ7B8NNGcJqJdmpE2IQPgMzPAFkL1iJl5gALTiTqhJnUjxLpk1go68YYDxka7uDqhBaepvDs5Vj1gpKxBgC5nDj+DwTwLvDelGDWbHJPh2JGCXCSatCT7W4WjAgGQTBTCQhVlGINBaBQ7ArGAnDND6gFnM78r1kFzhhDExxkQGQgRDlbwKR1BYogahIBDYiYSAlyQLSFwVBXyFYqI0w2xO5HTFrrkFBEjYwESVgKoNDBT0YQlT4xyQaXlywaaCZ3nypnyTpYoFwNiOAjynIhzEjvBuBoznkLzPxQbPr-nJaiYjl1Ain6aTlmABy+rYg6DAr1nNboRLjwVPw2zFZaI6KAIAUjqektDTzoyNBiRh4lzSIeBcb1BPRNALLpJeI+IyC0W5zUiAlVgNBLiVK4WGAhJ1JlLRFBFQp0qwpQBCXYiwIMbVhGZAZNA8pBxYTVqYwXJFK8VLIGQhqsBhqkBCXnymKiWkoSUMjqiKSmHzhOBuBiVZlRbEaObXlFpOSqX4VjlYWMg4UHkLhsqizsrVqiyyGEYPwkbQYoWyqM5HBxIKkj6FzjnYz7qzSilFJkjNaeVfmPp-nMxCVfjmakhHBvj9xhjYyviezmClQ4zEmLhkUmrOYlbaIJYsCqV+CuDwKlzvBmBPjhGwScrBZ5UOAOVFX3q9b9by60UyRaCLioTKhFgNhjUaiiwmIcURKnEXJ2lLXgWTRmC4hTJVgkynABB2lfaVmoWM7oT0WviR4hz+AnURGzgaCw4NprVtVLkAhJEKH44n73XJWIwOABjNBglIbZxbXvClx1AnL+Duz0axVipJEAHJ6L6g2wBgHMwX6b5gDb5CVTywKKiXVfBCp+CD6vA6DfiYyToqS3WuEqGggUHF5LWaWYp87HCaiGg2EViIIiy4x0i4x0lxVJHXETFZF3HTFNQFHzH4CLG0WYxHGVKuBmZhinABQOK3UqkFp6k4m0WXw6gyG62TyGCsUYaGw83NBMgJqVIFYA3yEjFY4G1qkalak6lG0xng15QMg6BcVEjLg4gv4YZfjk0f7mBXAx5PAs0k60Vtp1B7pKYaDQ2SnmlBxUi6CkhfD+zo2o5u2z63K46QBLWkhzp5yGzAq+AfCD4BTv7Hn6ZlIrrBCBBAA */
  id: 'submission',
  type: 'parallel',
  context: ({ input }) => input,
  states: {
    form: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'start submission': [
              {
                target: 'adding metadata',
                guard: 'is new submission',
              },
              {
                target: 'uploading existing pdf',
                guard: {
                  type: 'is existing submission',
                  params: { type: 'existing' },
                },
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
                guard: 'is grid datum',
              },
              {
                target: 'entering latitude',
                guard: 'is geographic datum',
              },
            ],
            BACK: [
              {
                target: 'adding metadata',
                guard: 'is new submission',
              },
              {
                target: 'uploading existing pdf',
                guard: 'is existing submission',
              },
            ],
            SKIP: {
              target: 'reviewing',
              guard: 'is existing submission',
              actions: ['clearDatum', 'clearGridCoordinates', 'clearGeographicCoordinates'],
            },
            RESET: {},
            UPDATE_CONTEXT: {
              target: 'choosing datum',
              reenter: true,
            },
          },
        },
        'entering alternate grid coordinates': {
          exit: 'saveToContext',
          on: {
            NEXT: [
              {
                target: 'uploading photos',
                guard: 'is new submission',
              },
              {
                target: 'reviewing',
                guard: 'is existing submission',
              },
            ],
            BACK: [
              {
                target: 'entering ellipsoid height',
                guard: 'is geographic datum',
              },
              {
                target: 'entering grid coordinates',
                guard: 'is grid datum',
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
                guard: 'is new submission',
              },
              {
                target: 'reviewing',
                guard: 'is existing submission',
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
                guard: 'is grid datum',
              },
              {
                target: 'entering alternate grid coordinates',
                guard: 'is geographic datum',
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
                guard: 'is new submission',
              },
              {
                target: 'uploading existing pdf',
                guard: 'is existing submission',
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
                guard: 'is grid datum',
              },
              {
                target: 'converting coordinates to decimal degrees',
                guard: 'is geographic datum',
              },
            ],
          },
        },
        'projecting grid coordinate': {
          invoke: {
            src: 'project',
            id: 'project grid',
            input: ({ context: { grid } }) => grid,
            onDone: [
              {
                target: 'format grid results',
                actions: assign({
                  decimalDegrees: ({ event }) => event.output.geometries[0],
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
            src: 'coordinateToDecimalDegrees',
            input: ({ context: { geographic } }) => geographic,
            id: 'convertCoordinatesToDecimalDegrees',
            onDone: [
              {
                target: 'determining zone',
                actions: assign({
                  decimalDegrees: ({ event }) => event.output,
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
            src: 'queryForCounty',
            id: 'queryForCounty',
            input: ({ context: { decimalDegrees } }) => decimalDegrees,
            onDone: [
              {
                target: 'successfully queried for county',
                actions: assign({
                  zone: ({ event }) => {
                    if ((event.output?.features?.length ?? 0) < 1) {
                      return '';
                    }

                    const county = event.output.features[0].attributes['NAME']?.toLowerCase();

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
            src: 'projectToStatePlane',
            id: 'projectToStatePlane',
            input: ({ context: { decimalDegrees, zone } }) => ({
              zone,
              decimalDegrees,
            }),
            onDone: [
              {
                target: 'format geographic results',
                actions: assign({
                  statePlane: ({ event }) => event.output.geometries[0],
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
            src: fromPromise(
              ({ input: { decimalDegrees } }) =>
                new Promise((resolve) => {
                  const dmsCoords = new DmsCoordinates(decimalDegrees.y, decimalDegrees.x);

                  resolve(dmsCoords.dmsArrays);
                }),
            ),
            id: 'formatResults',
            input: ({ context: decimalDegrees }) => decimalDegrees,
            onDone: [
              {
                target: 'done',
                actions: assign(({ context, event }) => {
                  context.geographic = { northing: {}, easting: {} };
                  const { longitude, latitude } = event.output;

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
            actions: assign(({ context }) => {
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
        rejected: {
          on: {
            BACK: {
              target: 'idle',
            },
          },
        },
      },
    },
  },
});
