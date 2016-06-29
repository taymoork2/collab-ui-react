const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch' || ENV === 'test-debug';
const isTestDebug = ENV === 'test-debug';
const isProd = ENV === 'build';

module.exports = {
  isTest,
  isTestDebug,
  isProd,
};
