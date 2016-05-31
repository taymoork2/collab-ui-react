/**
 * E2E & Sauce Labs Tasks
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var processEnvUtil = require('../utils/processEnvUtil.gulp')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var del = require('del');
var fs = require('fs');
var hmac = require('crypto-js/hmac-md5');
var log = $.util.log;
var messageLogger = require('../utils/messageLogger.gulp')();
var protractor = require('gulp-protractor').protractor;
var runSeq = require('run-sequence');
var uuid = require('uuid');
var _uuid;
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var compression = require('compression');
var fileListParser = require('../utils/fileListParser.gulp');
var _ = require('lodash');

/*******************************************************************
 * E2E testing task
 * Usage: gulp e2e      Runs tests against the dist directory
 * Options:
 * --sauce              Runs tests against SauceLabs
 * --production-backend Runs tests against local atlas with production services
 * --int                Runs tests against integration atlas
 * --prod               Runs tests against production atlas
 * --nosetup            Runs tests without serving the app
 * --noretry            Runs tests without retrying failed specs
 * --nofailfast         Runs tests without skipping tests after first failure
 * --specs              Runs tests against specific files or modules
 * --build              Runs tests against the build directory
 * --verbose            Runs tests with detailed console.log() messages
 ******************************************************************/
gulp.task('e2e', function (done) {
  var e2eTasks = [];
  var retryTasks = mkRetryTaskList();

  // important: only call 'protractor:clean' before running tests, as jenkins must use the results
  //   data for further post-build processing
  e2eTasks = ['e2e:setup',
      'protractor:clean',
      'sauce:start',
      'protractor'
    ]
    .concat(retryTasks)
    .concat([
      'sauce:stop',
      'connect:stop',
      done
    ]);

  if (args.nosetup) {
    _.pull(e2eTasks, 'e2e:setup');
    _.pull(e2eTasks, 'connect:stop');
  }
  if (!args.sauce) {
    _.pull(e2eTasks, 'sauce:start');
    _.pull(e2eTasks, 'sauce:stop');
  }
  if (args.noretry) {
    _.pull(e2eTasks, 'protractor:retry');
  }
  runSeq.apply(this, e2eTasks);
});

/*******************************************************************
 * E2E testing task
 * Usage: gulp protractor   Runs tests against the dist directory
 * Options:
 * --specs=squared          Runs only tests in test/squared directory
 * --specs=huron            Runs only tests in test/huron directory
 * --specs=hercules         Runs only tests in test/hercules directory
 * --specs=mediafusion      Runs only tests in test/mediafusion directory
 * --specs=filepath         Runs only tests in specified file
 * --specs=fromfile         Runs only tests from within a file
 * --filename=filepath      Specify the filename
 * --build                  Runs tests against the build directory
 * --verbose                Runs tests with detailed console.log() messages
 ******************************************************************/
gulp.task('protractor', ['set-env', 'protractor:update'], function () {
  var debug = args.debug ? true : false;
  var opts = {
    configFile: 'protractor-config.js',
    noColor: false,
    debug: debug,
    args: [
      '--params.log', !!args.verbose,
      '--params.isProductionBackend', !!args['production-backend'],
      '--params.isFailFast', !args.nofailfast //default isFailFast true
    ]
  };

  var tests = [];
  if (args.specs) {
    var specs = args.specs;
    // TODO: after storm launch, refactor this make use of '.../utils/fileListParser.gulp.js'
    if (specs === 'fromfile') {
      if (args.filename) {
        var filename = args.filename;
        try {
          var e2ePrTests = fs.readFileSync('./' + filename, "utf8");
          tests = e2ePrTests.split('\n');
          tests = tests.filter(function (test) {
            return test.trim() !== '';
          });
          messageLogger('Running End 2 End tests from file: ' + $.util.colors.gray(specs));
        } catch (err) {
          messageLogger('Error:: ' + $.util.colors.red(err));
        }
      } else {
        messageLogger('Error:: ' + $.util.colors.red("'--filename' is not specified."));
      }
    } else if (!specs.match(/_spec.js/)) {
      tests = 'test/e2e-protractor/' + specs + '/**/*_spec.js';
      messageLogger('Running End 2 End tests from module: ' + $.util.colors.gray(specs));
    } else {
      tests = specs.split(',');
      messageLogger('Running End 2 End tests from file: ' + $.util.colors.gray(specs));
    }
  } else if (args['files-from']) {
    var filesFrom = args['files-from'];
    try {
      tests = fileListParser.toList(filesFrom);
      messageLogger('Running End 2 End tests from file: ' + $.util.colors.gray(filesFrom));
    } catch (err) {
      messageLogger('Error:: ' + $.util.colors.red(err));
    }
  } else {
    tests = [].concat(
      config.testFiles.e2e.squared,
      config.testFiles.e2e.hercules,
      config.testFiles.e2e.sunlight,
      config.testFiles.e2e.webex,
      config.testFiles.e2e.mediafusion
    );
    messageLogger('Running End 2 End tests from all modules.');
  }

  messageLogger('#### Starting E2E Run: ' + processEnvUtil.getE2eRunCounter());
  return gulp.src(tests)
    .pipe(protractor(opts))
    .on('error', function (e) {
      this.emit('end'); // allows gulp process to continue instead of exiting
    });
});

gulp.task('protractor:retry', function (done) {
  var retrySpecList;
  if (fs.existsSync(config.e2eFailRetry)) {
    //TODO notify first failures somewhere?

    // mv default retry file to more specific name correlating to its run
    // ex. './.e2e-fail-retry' -> './cache/e2e-fail-retry-run-0'
    retrySpecList = config.cache + '/' + _.trimLeft(config.e2eFailRetry, '.') + '-run-' + processEnvUtil.getE2eRunCounter();
    fs.renameSync(config.e2eFailRetry, retrySpecList);

    // update the source of specs for the next run
    args['files-from'] = retrySpecList;
    delete args.specs;

    // now we can increment the run counter and re-run
    processEnvUtil.setE2eRunCounter(processEnvUtil.getE2eRunCounter() + 1);
    runSeq('protractor', done);
  } else {
    messageLogger('Nothing to retry');
    done();
  }
});

gulp.task('protractor:update', webdriverUpdate);

gulp.task('set-env', function () {
  if (args.sauce) {
    sourceSauce();
  }
  if (args.prod) {
    sourceProduction();
  } else if (args.int) {
    sourceIntegration();
  }
});

gulp.task('protractor:clean', function () {
  return del([config.e2eFailRetry, config.e2eFailRetrySpecLists, config.e2eReports]);
});

/**
 * SAUCELABS TASKS
 */

// Start a sauce connect tunnel for testing a local app
gulp.task('sauce:start', function () {
  sourceSauce();
  return gulp.src('')
    .pipe($.shell('./sauce/start.sh'));
});

// Stop a sauce connect tunnel
gulp.task('sauce:stop', function () {
  sourceSauce();
  return gulp.src('')
    .pipe($.shell('./sauce/stop.sh'));
});

// Get an authenticated url for sauce job results
// gulp sauce:job --http://saucelabs.com/jobs/<id>
gulp.task('sauce:job', function () {
  sourceSauce();
  var arg = process.argv.pop();
  var message = arg.split('/').pop();
  var auth = hmac(message, process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY);
  log(arg.replace('--', '') + '?auth=' + auth);
});

// Test and document API perfomance
gulp.task('test:api', function () {
  var opts = {
    reporter: 'spec',
    timeout: 30000,
    'async-only': true
  };

  return gulp
    .src(['test/api_sanity/squared_test.js'], {
      read: false
    })
    .pipe($.mocha(opts));
});

// E2E Setup tasks
gulp.task('e2e:setup', function (done) {
  var buildTask = args.build ? 'build' : 'dist';
  if (!args.nosetup) {
    runSeq(
      // TODO: make mocha not exit on errors
      // 'test:api',
      buildTask,
      'eslint:e2e',
      'connect',
      done
    );
  } else {
    log($.util.colors.yellow('--nosetup **Skipping E2E Setup Tasks.'));
    return done();
  }
});

// Connect server for E2E Tests
gulp.task('connect', function () {
  var rootDir = args.build ? config.build : config.dist;
  messageLogger('Connecting server from the ' + rootDir + ' directory.');
  $.connect.server({
    root: [config.test, rootDir],
    port: 8000,
    middleware: function () {
      return [
        compression(),
        customCSPmiddleware
      ];
    },
    livereload: false
  });
});

gulp.task('connect:stop', function () {
  $.connect.serverClose();
});

/////////////////////////////

function sourceSauce() {
  $.env({
    file: './test/env/sauce.json',
    vars: {
      "SC_TUNNEL_IDENTIFIER": _uuid || (_uuid = uuid.v4())
    }
  });
}

function sourceIntegration() {
  $.env({
    file: './test/env/integration.json'
  });
}

function sourceProduction() {
  $.env({
    file: './test/env/production.json'
  });
}

function mkRetryTaskList() {
  var runCounterMax = processEnvUtil.getE2eRunCounterMax();
  return _.fill(Array(runCounterMax), 'protractor:retry');
}
