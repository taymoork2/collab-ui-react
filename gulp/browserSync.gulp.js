/**
 * SERVE AND BROWSERSYNC
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var messageLogger = require('./messageLogger.gulp')();
var reload = browserSync.reload;
var runSeq = require('run-sequence');

// Serve
gulp.task('serve', function (done) {
  var preTask = args.dist ? 'dist' : 'build';
  runSeq(
    preTask,
    'browser-sync',
    done
  );
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
      baseDir: baseDir
    },
    ghostMode: args.browserall ? ghostMode : false,
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'info',
    logPrefix: 'browser-sync',
    reloadDelay: 1000,
    browser: browser,
    open: open
  };

  browserSync(options);

  if (!args.dist) {
    gulp.watch([
      config.app + '/**/*.scss',
      config.vendorFiles.scss.files
    ], [
      'scss:build'
    ]);
    // .on('change', logWatch);

    if (args.nounit) {
      gulp.watch([
          config.appFiles.js
        ], [
          'copy:changed-files',
          'index:build'
        ])
        .on('change', logWatch);
    } else {
      gulp.watch([
          config.appFiles.js
        ], [
          'karma-watch',
          'copy:changed-files',
          'index:build'
        ])
        .on('change', logWatch);
    }

    gulp.watch([
        config.vendorFiles.js
      ], [
        'copy:build-vendor-js',
        'index:build'
      ])
      .on('change', logWatch);

    gulp.watch([
        config.appFiles.tpl
      ], [
        'template-cache'
      ])
      .on('change', logWatch);

    gulp.watch([
        config.appFiles.lang
      ], [
        'copy:changed-files'
      ])
      .on('change', logWatch);

  }

  /////////////////////////////

  function logWatch(event) {
    messageLogger('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    var path = event.path;
    var pathArray = path.split('/');
    var appIndex = pathArray.indexOf('modules') + 1;
    var parentIndex = pathArray.length - 1;
    var parentDirectory = pathArray.slice(appIndex, parentIndex).join('/');
    testFiles = ['test/' + parentDirectory + '/**.spec.js', 'app/**/' + parentDirectory + '/**.spec.js'];
    changedFiles = path;
  }

  function isLinux() {
    return process.platform === 'linux';
  }
});
