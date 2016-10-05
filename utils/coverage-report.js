var _ = require('lodash');
var glob = require('glob');
var istanbul = require('istanbul');
var loadCoverage = require('remap-istanbul/lib/loadCoverage');
var remap = require('remap-istanbul/lib/remap');
var reporter = new istanbul.Reporter(undefined, 'test/coverage/combined/');

var NO_SOURCE_MAP = 'Error: Could not find source map for:';
var JS_SUFFIX = '.js"';
var EXCLUDING = 'Excluding:';

glob('test/coverage/json/*.json', {}, function (er, files) {
  var collector = remap(loadCoverage(files), {
    exclude: 'karma',
    warn: function (_msg) {
      var msg = _.toString(_msg);
      if (_.includes(msg, NO_SOURCE_MAP)) {
        // Don't warn for javascript files - they won't have a source
        if (!_.includes(msg, JS_SUFFIX)) {
          console.warn(msg);
        }
      } else if (!_.includes(msg, EXCLUDING)) {
        console.warn(msg);
      }
    },
  });

  reporter.addAll(['html', 'cobertura']);
  reporter.write(collector, true, _.noop);
});
