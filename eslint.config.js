import globals from 'globals';
import { configs } from 'eslint-config-airbnb-extended';

export default [
  ...configs.base.recommended,
  ...configs.react.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      'linebreak-style': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-underscore-dangle': ['error', { allow: ['_embedded'] }],
      'react/require-default-props': 'off',
    },
  },
];
