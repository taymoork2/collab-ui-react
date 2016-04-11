/**
 * SERVE AND BROWSERSYNC
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var messageLogger = require('../utils/messageLogger.gulp')();
var reload = browserSync.reload;
var runSeq = require('run-sequence');
var compression = require('compression');
var testFiles;
var changedFiles;

// Serve
gulp.task('serve', function (done) {
  var preTask = args.dist ? 'dist' : 'build';
  runSeq(
    preTask,
    'watch',
    'browser-sync',
    done
  );
});

gulp.task('watch-serve', function (done) {
  runSeq('watch', 'browser-sync', done);
});

// BrowserSync
gulp.task('browser-sync', function () {
  if (browserSync.active) {
    return;
  }
  var browser;
  var baseDir = args.dist ? config.dist : config.build;
  var open = 'external';
  var ghostMode = {
    clicks: true,
    location: false,
    forms: true,
    scroll: true
  };

  if (args.browserall) {
    if (isLinux()) {
      browser = ['google-chrome', 'firefox', 'safari'];
    } else {
      browser = ['google chrome', 'firefox', 'safari'];
    }
  } else if (args.firefox) {
    browser = ['firefox'];
  } else if (args.safari) {
    browser = ['safari'];
  } else {
    if (isLinux()) {
      browser = ['google-chrome'];
    } else {
      browser = ['google chrome'];
    }
  }

  var options = {
    host: '127.0.0.1',
    port: 8000,
    server: {
      baseDir: baseDir,
      middleware: [compression()]
    },
    ghostMode: args.browserall ? ghostMode : false,
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'info',
    logPrefix: 'browser-sync',
    reloadDelay: 1000,
    browser: browser,
    open: args.noopen ? false : open,
  };

  browserSync(options);

  /////////////
  function isLinux() {
    return process.platform === 'linux';
  }
});
