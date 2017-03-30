module.exports = {
  extends: ['../.eslintrc.js'],
  env: {
    es6: true,
  },
  rules: {
    'no-param-reassign': [2, {
      props: false,
    }],
  },
};
