/**
 * UNIT TESTING TASKS
 */
'use strict';

/* global __dirname */
var os = require('os');
var gulp = require('gulp');
var config = require('../gulp.config')();
var fileListParser = require('../utils/fileListParser.gulp');
var messageLogger = require('../utils/messageLogger.gulp')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var args = require('yargs').argv;
var karma = require('karma').server;
var runSeq = require('run-sequence');
var log = $.util.log;
var path = require('path');
var _ = require('lodash');

var modules = _.map(config.testFiles.spec, function (val, key) {
  return key;
});

/*
 * unitTests.gulp.js:
 *
 * This file creates gulp tasks to:
 *   `gulp karma-config-{module}` ->  build individual karma-config files based on module
 *   `gulp run-karma-{module}`    ->  run individial module tests
 *   `gulp karma-{module}`        ->  [karma-config-{module} && run-karma-{module}]
 *
 *   `gulp karma-config`          ->  [karma-config-all]
 *   `gulp karma`                 ->  [karma-all]
 *
 *   `gulp karma-config-parallel` ->  runs every karma-config-{module} in parallel
 *   `gulp karma-sync-seg`        ->  [karma-config-parallel] then groups run-karma-{module}
 *                                    into segments and runs a few at a time
 *   `gulp karma-each`            ->  runs each karma-{module} one after another
 *
 *   NOTE: modules are pulled from gulp.config.js -> config.testFiles.spec
 *   NOTE: `karma-watch` tasks are in watch.gulp.js
 */

/*
 * This convenience function builds the karma-{module} tasks.
 *
 * They are used to test individual modules at one at a time
 * by runing karma-config-{module}, followed by run-karma-{module}
 */
_.forEach(modules, function (module) {
  gulp.task('karma-' + module, function (done) {
    runSeq('karma-config-' + module, 'run-karma-' + module, done);
  });
});

/*
 * This convenience function builds the run-karma-{module} tasks.
 *
 * They assume you have ran proper karma-unit-{module}.js file
 * in the proper location.
 *
 * run-karma-{module} will run karma for the karma-unit-{module}.js
 */
_.forEach(modules, function (module) {
  gulp.task('run-karma-' + module, createGulpRunKarmaModule(module));
});

/*
 * This convenience function builds the karma-config-{module} tasks.
 *
 * This creates a karma-unit-{module}.js file and places it.
 */
_.forEach(modules, function (module) {
  gulp.task('karma-config-' + module, createGulpKarmaConfigModule(module));
});

// Dont want to break preexisting behavior
gulp.task('karma', ['karma-all'], function (done) {
  done();
});

// Dont want to break preexisting behavior
gulp.task('karma-config', function (done) {
  runSeq('karma-config-all', done);
});

// Quickly create each karma-config-{module} file
gulp.task('karma-config-parallel', karmaConfigParallelArray());

/**
 * Runs [threads] run-karma-{module} at once, defaults
 * to the number of available cores on the machine
 *
 * Usage: `gulp karma-sync-seg [--threads=#]`
 */
gulp.task('karma-sync-seg', function (done) {
  var threads = args.threads || os.cpus().length;
  messageLogger('Running on ' + threads + ' threads');
  var karmaArgs = ['karma-config-parallel'];
  var newArr = [];
  _.forEach(modules, function (module, index) {
    if (module !== 'all') {
      if (index % threads === 0) {
        karmaArgs.push(newArr);
        newArr = [];
      }
      newArr.push('run-karma-' + module);
    }
  });
  karmaArgs.push(done);
  runSeq.apply(this, karmaArgs);
});

gulp.task('karma-each', function (done) {
  var karmaArgs = [];
  _.forEach(modules, function (module) {
    if (module !== 'all') {
      karmaArgs.push('karma-' + module);
    }
  });
  karmaArgs.push(done);
  runSeq.apply(this, karmaArgs);
});

function createGulpKarmaConfigModule(module) {
  // Compile the karma template so that changes
  // to its file array aren't managed manually
  return function (done) {
    if (!args.nounit) {
      var unitTestFiles = [].concat(
        config.vendorFiles.js,
        config.testFiles.js,
        config.testFiles.app,
        config.testFiles.global
      );

      // any other 'specs' target should already be defined in 'gulp.config.js'
      if (module !== 'custom') {
        unitTestFiles = unitTestFiles.concat(config.testFiles.spec[module]);
      } else {
        // for the 'custom' target, a '--files-from' option MUST be specified as a line-separated list of
        // files relative to the project root dir
        // (see: https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/About-Karma-Test-Selection#selecting-tests-by-custom-list-ie-gulp-karma-custom---files-from)
        var filesFrom = args['files-from'];
        var flist;
        if (!filesFrom) {
          log($.util.colors.red('Error: missing \'--files-from\' argument'));
          process.exit(1);
        } else {
          // parse each line item from file specified by '--files-from', and append to main list
          flist = fileListParser.toList(filesFrom);
          unitTestFiles = unitTestFiles.concat(flist);
        }
      }

      return gulp
        .src(config.testFiles.karmaTpl)
        .pipe($.inject(gulp.src(unitTestFiles, {
          read: false
        }), {
          addRootSlash: false,
          starttag: 'files: [',
          endtag: ',',
          transform: function (filepath, file, i, length) {
            return '\'' + filepath + '\'' + (i + 1 < length ? ',' : '');
          }
        }))
        .pipe($.rename({
          basename: 'karma-unit-' + module,
          extname: '.js'
        }))
        .pipe($.jsbeautifier({
          config: '.jsbeautifyrc',
          mode: 'VERIFY_AND_WRITE',
          logSuccess: false
        }))
        .pipe(gulp.dest(config.test));
    } else {
      log($.util.colors.yellow('--nounit **Skipping Karma Config Task'));
      return done();
    }
  };
}

function createGulpRunKarmaModule(module) {
  // Run test once and exit
  return function (done) {
    if (!args.nounit) {
      var options = {
        configFile: path.resolve(__dirname, '../../test/karma-unit-' + module + '.js')
      };
      if (args.watch) {
        options.autoWatch = true;
        options.singleRun = false;
      } else {
        if (args.debug) {
          options.browsers = ['Chrome'];
          options.preprocessors = {};
          options.browserNoActivityTimeout = 600000;
        } else {
          options.singleRun = true;
        }
      }
      karma.start(options, done);
    } else {
      log($.util.colors.yellow('--nounit **Skipping Karma Tests'));
      return done();
    }
  };
}

function karmaConfigParallelArray() {
  var karmaTasks = [];
  _.forEach(modules, function (module) {
    if (module !== 'all') {
      karmaTasks.push('karma-config-' + module);
    }
  });
  return karmaTasks;
}
