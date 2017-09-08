const glob = require('glob');
const fs = require('fs');
const path = require('path');
const karmaPath = path.resolve('./karma');

const istanbulCreateReporter = require('istanbul-api').createReporter;
const istanbulCoverage = require('istanbul-lib-coverage');

const map = istanbulCoverage.createCoverageMap();
const reporter = istanbulCreateReporter();
reporter.dir = './test/coverage/combined/';

glob('./test/coverage/json/*.json', {}, function (error, files) {
  if (error) {
    throw new Error(error);
  }
  if (!Array.isArray(files)) {
    throw new Error('Coverage files not found');
  }

  files.forEach(file => {
    const coverageJson = JSON.parse(fs.readFileSync(file, 'UTF-8'));
    map.merge(coverageJson);
  });

  map.filter((path) => {
    if (path.startsWith(karmaPath)) {
      return false;
    }
    return true;
  });

  reporter.addAll(['html', 'cobertura']);
  reporter.write(map);
});
