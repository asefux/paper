module.exports = {
  extends: 'airbnb-base',
  rules: {
    indent: ['error', 2],
    'no-tabs': 0,
    'import/no-unresolved': 1,
    camelcase: 0,
    'max-len': [2, 180, 2, { ignoreTemplateLiterals: true, ignoreStrings: true }],
  },
  env: {
    mocha: true,
  },
  globals: {
    expect: true,
  },
};
