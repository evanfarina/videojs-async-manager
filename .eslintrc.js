module.exports = {
    extends: ['eslint:recommended'],
    rules: {
      //airbnb-base overrides
      'no-console': 'off',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'prefer-rest-params': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off', // broccoli build is throwing off test paths
      'func-names': 'off',
      'import/extensions': 'off',
      'prefer-destructuring': ['error', { object: true, array: false }],
    },
    env: {
      browser: true,
      node: true,
    },
  };
  