import { browser } from '@ugrc/eslint-config';

export default [
  ...browser,
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
];
