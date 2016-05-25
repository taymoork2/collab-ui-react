/**
 * COPY TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');
var testFiles = [];
var changedFiles = [];

// Copy files for the build directory
gulp.task('copy:build', function (done) {
  messageLogger('Copying Build Files');
  runSeq([
      'copy:build-app-files',
      'copy:build-vendor-css',
      'copy:build-vendor-fonts',
      'copy:build-vendor-images',
      'copy:build-vendor-js'
    ],
    done);
});

gulp.task('copy:build-app-files', function () {
  var files = [].concat(
    config.app + '/*.{ico,png,txt,html}',
    '!index.html',
    config.app + '/' + config.images + '/**/*',
    config.appFiles.js,
    config.appFiles.json,
    config.appFiles.csv,
    config.appFiles.docs,
    config.app + '/.htaccess',
    '!' + config.testFiles.spec.all
  );
  messageLogger('Copying application files', files);
  return gulp
    .src(files, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-css', function () {
  messageLogger('Copying vendor CSS files', config.vendorFiles.css);
  return gulp
    .src(config.vendorFiles.css, {
      base: config.vendor
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.vendor))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-fonts', function () {
  messageLogger('Copying vendor Font files', config.vendorFiles.fonts);
  return gulp
    .src(config.vendorFiles.fonts)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.fonts))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-images', function () {
  messageLogger('Copying vendor Image files', config.vendorFiles.images);
  return gulp
    .src(config.vendorFiles.images)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.images))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-js', function () {
  messageLogger('Copying vendor JS files', config.vendorFiles.js);
  return gulp
    .src(config.vendorFiles.js, {
      base: config.vendor
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.vendor))
    .pipe(reload({
      stream: true
    }));
});

// Copy files for the dist directory
gulp.task('copy:dist', function (done) {
  runSeq([
      'copy:dist-appfiles',
      'copy:dist-vendor-fonts'
    ],
    done
  );
});

gulp.task('copy:dist-appfiles', function () {
  var files = [].concat(
    '**/*.svg',
    '*.{txt,html}',
    '!index.html',
    '**/*.json',
    '**/*.csv',
    'docs/**/*',
    '.htaccess'
  );
  messageLogger('Copying application files', files);
  return gulp
    .src(files, {
      cwd: config.build,
      base: config.build
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.dist));
});

gulp.task('copy:dist-vendor-fonts', function () {
  messageLogger('Copying vendor fonts files', config.vendorFiles.fonts);
  return gulp
    .src(config.vendorFiles.fonts)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.dist + '/' + config.fonts));
});
