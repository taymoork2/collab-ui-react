var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var istanbul = require('istanbul');

var collector = new istanbul.Collector();
var reporter = new istanbul.Reporter(undefined, 'test/coverage/combined/');

glob('test/coverage/json/*.json', {}, function (er, files) {
  _.forEach(files, function (file) {
    collector.add(JSON.parse(fs.readFileSync(file, 'utf8')));
  });

  reporter.addAll(['html', 'cobertura']);
  reporter.write(collector, true, _.noop);
});
