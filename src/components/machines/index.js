import { assign, createMachine } from 'xstate';

export const submissionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOiwgBswBiWAFwEMAnWgAlUxzyIG0AGAXUSgADvjy0ChISAAeiAEzyArMQCMANgDMygCzqlmpQE5NAdgA0IAJ6JTADh3FTvO3d6nlS3up2qAvn6W7Ni4kqQU1HRMrMGcktyqgkggouKS0nIIALSavJpOdkaq8jpKJV5FmpY2CKbqvMS8vEbyqkZK+nq8SgFB6CFcJPQQEFiEUCwYYAwQ9AxUAHIAogAaACp8SSJiWBJEGYhe8o2qdko6rrw6ZjoW1oiqvKqO6q-qbvUXeka9ILGhRGIw1G40m02Gc3oVAASksAMpLDYCaSpXbpZKZdTyIxOTRGdSmbTYlqqaqIBx2NRFHT4+R5PGmX7-QbEADGAAt8DtQbNaCgMItVkitikdnspBjEFkjDj5JpNIVHppVLlTqT7ghimZiO8DIT7K9tEz+nFARyuXgeXN+YL1gkRajxQcEF5GpoaaoDBp9EZTEoyZrlaYnPJXB86YUCcaOACSObuRNeTaAEIAQQAwgBpTYosXo0CZNU6nwegmVeXqAMmBp1dQmOyqQkdYzRgZheOWxPWgVprP23NpfaS7J1YjXByvanjnwB1yqRr1OV2OoRluBP4m2NszkJlhJgVwzMASQACjnko787Ipc5g6HfdjOiqlP6NSVHsRCu4ZTpf+cDK2ppxjunZ7t2MLwoi57bIOEoFogMrEPKdS+kopievYVQaqoKr5A4v72I+MqmIy67Mu2IFjF2fICgAqieAAiqZrEsAD66YAPILCxdrIheeZDvB2Qqg0nraJOTQ6IoCpVrkTivIUZSKviPxkZuLJgIQtBgIwVEsPQ5DaYwhBzGALBQLpEAsKyXKMCCpmwLawoDmignXggNLqI0TSmEYbiaIuJQBm0o6mL47gBa82KkX0MYaVpOl6QZRkmdp5mWdZtn2dpjnLHaiQuU6w5KB+752HSfmnHYWE1CUtxjoabQ4cUNI9GpcVhJpRlJYZOmpWZFlkJl+B2WMDlUL22Z8TBrlwe5bQvL+jw0rw0ltDVDyEvOnqnC4JRyi4gFbl1iWgslfWmelQ02SN2VwBNGbZgV-Gwc6JQ6uVdRPFopQykYwVmMcrhaCY5x6GUbWxW2gInbpZ29cZl2DVZN2jf1jmwgizkvbNzpYjihL4oSigyq06o1I2ypqCVRQlbkuR6Ed8XdfDKWXeQcy7CgEDUHl2MzUVQlZDhKjVSqJjvMqq1tMFxj5KcBgXPYeSlJoTOdQlcMTOdiNpRzEh8jzD19tNoqvcOWRep+YW+cYdJ6PYwUXJSaEeFJhpmMu6sw5rPVs3rnOG9QmNQabl5uZkwu+p+eLKm4BguNclbYb4OIaBceIlXVAHtdDJCw37F160QUBc0bfPQWbuMWyLMfPvKFxNC0ycU+hwbeGYeTLoo9QxRuHU+yz2sI-1LDkCXZfUJNlfh3NkdW8utwvkoZw3P92H1CooPeFJ1Jyt7+e+6zRdmeP4yTxBWMzwJc9SiFMcmLtCcOAFsseMQJglPYrW+CUB-EAXY+uszJgHIOQLAwhYD4CGuyMAWAoDsloE5a+5shYqm2sUbwzQjBXF8uvWqnovIGFJh4JoTx5D-0AcPf2ICwEQKgTAuBCCkHTzDjfZ0lsqaLxIo2BaxRgptwXAqR4X1lAeEoUfahJ8WCgPAZA6BVlYHwMQZfUODp2E12jtVR+8dcgvxbptKmO03DlSkno-+KBhDj2GHpYQnJaBiGQWw1B7ko6OBVBcHBBJ-LvADHKC4xBsTO3rHWC4FirH4BsaCOx+AHGOVYeolxkcNCBIfKcQwvCnjPGCiSMc2J3SKAMF4FU4TrEggmDEuJxsnqJOrkJRQ20SiSVvGYnJrQ8ktEKA2ew8dSmRPKSwSpjiQ78yroLeaxhAmenaFnc49RyYKFaA0NCyp2gkgrGrXOQFiCMDAAANywGAAA7lRapKC6nuTpPOHQiczAeJfOoBZCA5RoQau6EwQYV6-n-rsg5xzTnT2egLK8kccGUhFnYAkzRlS3AMc83uDVriNhfM0d4fSokTDADIHAEhokQAAGZONqeMyO0UqQ0jCqtDwPhXw1HxC7HwoZDA3Ckn3cigJLFlL0linFtiCWqNGbPDhPcnAdEMPYX0Ny-IBl8sGVZq1ujKm0C0CRQ8rooyymNHKRLCogrvp6OuwiV5iOuLSh4rViDFKJo8rw7g2XqQ1mq5Gw00bjQSbqiOUp3QND8k8d0no0Khh0MFZ4Xk97yC0C+EWmyobbKoeql1d0MaQUFRotBWjY4RswY8bEZrNStHyHiHCzRWg4O0DoVVp0Jhn1LkHHVOMSW2ANViMSdRbh5FaLLHwY48gtDpHkcWMb+55wAZIseE863uobXq55fkdQuHqAqPyPgYVOzaGoHwRg9A3KuL4SGw641jv1hfCuziLmZHQioFteofDOG0BtTUqcN00m3ZJXw9qB6HzVceydj1zmNoQNoBly0fCFFKA2YK3gcTKneMUVwvkV2Vq1mPQO3Ng4pv-TO-GuIiZElJk84oKokJFG6N4-1zwkPcrofIxhyikGnuJTOy9OpWg3vbdoAjW1qZNTpnkXdlHQSyPoQolgSjmFnLPQBhmlqt10gjSUNw7Qu2OBuUakWzxQwCcxdRhhiimEqJGZhz1CBsOEwJHhkkBGXzHBIvWEKLgFR2ACOuQg+AebwGSOykgZBKAetvh5ecCpShoR2ivP0kKAxvDUGYDoTQFQJ33V5oEIw9JTBmJCPzzpfxpybHKPEHwOhVm8DqFUEay0mCKP4LZW4Ox6X3JlmuwZ9BNXKqVgKEZIOrWi7eMKNKfJaf0iPJGGVUZJoa0JBkxZ8Q7qTg7YKbgbM22UM8JoygnPVeZlWwbNCUMGzQ+N1xvh8jRUhViPI5wPBO0hWoMKOEcHPhKh+kd8adajxrZPA7kcpINGxHFso33IX4mCloSkQYPS4NaOoAbr3LpCZo3pujn2pRLUCUU5wxhdrujzbtRbtxls7uUFDjbYROX9NsfYsQSPsjvSXNcVankGxrb8dibafl8TuHKvJxLDrAS-MOSc8YVOsg2dY0E6qtxtBuz8WYpCxQ7ZlCuBoJ72zScYpkdiugfL8VC53Z+OsndfzIUbLOF8SF5B+iKBLG1qlY3HTHc60bWq4A64Ck4T0DZHlYi-tj0MlJbNga8PqIdSX43vaDlT38NZXg3OKAaJV2Pt15ICgtEi5n1u2828hn9+3p3GakpSbxfo46+TxPIYKvunB4O+LvX0A24e6dE-p2gEfDBJ69GYH07hg0bwVLLi3GOJzXAPkL9oXkIVQsfrCgMrsbt4kqJCwpzm-BAA */
  createMachine(
    {
      preserveActionOrder: true,
      predictableActionArguments: true,
      id: 'submission',
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
            NEXT: {
              target: 'uploading photos',
              cond: 'is new submission',
            },
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
    {
      actions: {
        saveToContext: assign((context, event) => {
          if (!event.meta) {
            return context;
          }

          context[event.meta] = event.payload;

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
