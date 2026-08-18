import { browser } from '@ugrc/eslint-config';

export default [
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'functions/lib/**',
      'functions/shared/dist/**',
      'public/assets/**',
    ],
  },
  ...browser,
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
];
