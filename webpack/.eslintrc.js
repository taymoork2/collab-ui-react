module.exports = {
  extends: ["airbnb-base"],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  }
};
