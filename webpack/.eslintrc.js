module.exports = {
  extends: ["airbnb-base"],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],
    'function-paren-newline': 0,
    'import/no-extraneous-dependencies': 0,
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  }
};
