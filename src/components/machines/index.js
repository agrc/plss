import { assign, createMachine } from 'xstate';

export const submissionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOiwgBswBiWAFwEMAnWgAlUxzyIG0AGAXUSgADvjy0ChISAAeiAEzyArMQCMANgDMygCzqlmpQE5NAdgA0IAJ6JTADh3FTvO3d6nlS3up2qAvn6W7Ni4kqQU1HRMrMGcktyqgkggouKS0nIIALTydip2PqZGqkrq8rxe8pY2CPZGThq88pqabvI67gFB6CFcJPQQEFiEUCwYYAwQ9AxUAHIAogAaACp8SSJiWBJEGYiVxLyqeTquvDpmOhbWiKqHjuoP6m7qZw7qRl0gsaFExADGAAt8JsRiwprQUBg5ktVgJpKktulkpkcqYDsYdEpPJdNCZVNUbqp5PViSZ5D5moZOoEvj04r9AcC8KDwZDoSsEusUpttlJkYgsmY1HZTKYOiYWh1yQSEKpVEZ6pjjJpVFLVepTJ9vn1-kCQaNWVCAEIAQQAwgBpNbwnlI0CZI6qYgPHQ6Yoa4otTTqGUmXhOB4mOyqUyGfQfGnasKM-Vg6Zs02Wzk2tI7fnZUzqYjnN7vVU5nwy1xO7xNVqZ8p5CPdDg-EhgQi0MCMYajejkJuMQjTMAsP7AxhDbtN2Ds2FchG83bZYkltymIn6LxYn3XWUPeTEJQOUXnE52XF2LV0uvEBud1ssdud4e9-v4QfDHujhYcxIpxFp+0Cy6b0UHo4dGUfQfB0GUjgXJwjAcEN2iMMUmmPWsdXPZtL2vZtbz7Ach2fKhEytOFkknO1ZEQTRHCUKiiSMICDyo1xwJOJ0vF4FpDgXIwXB0JDejCFBhHIfABkvYQgVoMQx2tYjbS-MjsiJFR1CJct5FUCiiUzcCin9CUlD0FUjEKdRePpEgBKEkTQTE-AJNHAjpI2VM+W-BBcizc4y2AlUKKqNcNC47MjFybcFR8CjTNPRgwAANywMAAHdW3w81CInWSXPktT-Q8BdbnJZT1NMJRtMCiVLh8GCsSPSMTx1aK4sS5KHPfGTnOnXxNAOdonkqMUFzscCNy3HcziUdSKJOSKdQs4Sh1GMAZBwCRrIgAAzKSiKcz9MpRYk0XlN0EPkDwfBKtcjLsLcKXoi4gM1WrkLCVCW1BKAWwgbCH1wkcUqTLbuXa9Mcng4gD2JADNAqHwjHA7x6hVJ4iVcIozum57GzQt6Pq+x9bxfGFHMBnbpxBg7aPgqVTsxcDvX9M5iQo3haI1bR0d+F7LyEkYthQCBqAcgGSLkh19OICimaMsooZOwb-NyLrFMxYlFGDIp2frTHXtGbmoF5-nNvSoHXPGxwxTCuV9PG7wmMULdbg1ODVXKEzHr4jmta56Z9eoV9xw-Kd01Npw3SMy3MQd8DlDRQ4VV4Co5WUNiNbPT3QXIb2IQNwWjZJ9NtCu0pbj0E5aO3fF-Ph8WNGDXIRSM84U850EwHIcgsGEWB8DIFgATALAoABWg-rSgPSNFxwJfFDcZeK2mXgOICTHFPRQ3kJu04WtuO67nu+4HofDbHkW9lVEOFVo0UuJcCuahKYqnEMQx6LseDvACGlCHwfn4GSKNfjIJQY+u1EC+HFg4KiC5xrbmKgUGUjw1BmFKPHVoBgKgpwGPNMYEwBjTHoMAjqbo1ChixC0aC3hSi+m8M6dS5IuK4lxHKFOMZmQGnjBgAhwMQzOnGsUOwaltDekrHDJoiDnC7jOvHB6NZ3aawvKCDCXYey4x+nAThrksgGC3BRZSRRcpKA8GccCRdhRkOOC4V+PE3ZmWILNKyowbJ2XUfJLI3DMRlxFEVUUqptKtGIMvew25yhCJTg1eKSURjOMyI4CoYogIVHaFDHc4FPGLxgsVbc40tApzsVgxay1RLrSiT+eOYN3hmDOOcMwIYixUXFidYw8pvTKWMBveRox3o93vHjZ8xTsgMOugUB4UMn7jSuHfVUXUzp4gKLkXcbSsY6yIHrLOYA+nEizA4VwccqRuDAv5KG-pgzQQ8GpdoBjNALO1iwDOEhVnrMzOLAwYVyTqQeCUcCqoVCKDdM0CorpcTr2saeZuW926d27p9feg9aDrKMmDfcOyvBuDMLbLMuILnKXDCYDWfTNHlCcPYFUDhgKlH2TUAxB1QwX16liN0H8-BAA */
  createMachine(
    {
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
          },
        },
        'entering alternate coordinates': {
          entry: 'calculateCoordinates',
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
              target: 'entering ellipsoid height',
            },
          },
        },
        'uploading photos': {
          exit: 'saveToContext',
          on: {
            NEXT: {
              target: 'reviewing',
            },
            BACK: {
              target: 'entering alternate coordinates',
            },
          },
        },
        reviewing: {
          exit: 'submit',
          type: 'final',
          on: {
            BACK: [
              {
                target: 'uploading photos',
                cond: 'is new submission',
              },
              {
                target: 'entering alternate coordinates',
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
          },
        },
        'entering grid coordinates': {
          exit: ['saveToContext', 'clearGeographicCoordinates'],
          on: {
            BACK: {
              target: 'choosing datum',
            },
            NEXT: {
              target: 'entering alternate coordinates',
            },
          },
        },
        'entering longitude': {
          exit: 'saveToContext',
          on: {
            BACK: {
              target: 'entering latitude',
            },
            NEXT: {
              target: 'entering ellipsoid height',
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
          },
        },
        'entering ellipsoid height': {
          exit: 'saveToContext',
          on: {
            BACK: {
              target: 'entering longitude',
            },
            NEXT: {
              target: 'entering alternate coordinates',
            },
          },
        },
      },
    },
    {
      actions: {
        saveToContext: assign((context, event) => {
          console.log('context before', context);
          context[event.meta] = event.payload;
          console.log('context after', context);

          return context;
        }),
      },
      guards: {
        'is new submission': (context) => context.type === 'new',
        'is existing submission': (context) => context.type === 'existing',
      },
    }
  );
