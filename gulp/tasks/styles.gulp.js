/**
 * STYLES TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var processEnvUtil = require('../utils/processEnvUtil.gulp')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var jsonImporter = require('node-sass-json-importer');
var reload = browserSync.reload;
var errorLogger = require('../utils/errorLogger.gulp');
var messageLogger = require('../utils/messageLogger.gulp')();
var colors = $.util.colors;
var log = $.util.log;

gulp.task('scss:build', ['clean:css'], function () {
  messageLogger('Compiling SCSS --> CSS');
  return gulp
    .src('app/styles/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.plumber(function (error) {
      log(colors.red(error));
      if (processEnvUtil.isJenkins()) {
        log('Environment is jenkins, aborting...');
        process.exit(1);
      } else {
        this.emit('end');
      }
    }))
    .pipe($.sass({
      outputStyle: 'compact',
      includePaths: config.vendorFiles.scss.paths,
      importer: jsonImporter
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', '> 5%']
    }))
    .pipe($.rename({
      dirname: 'styles/',
      basename: config.cssName,
      extname: '.css'
    }))
    .pipe($.if(args.verbose, $.print()))
    .pipe($.sourcemaps.write('/'))
    .pipe(gulp.dest(config.build))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }));
});

gulp.task('watch:scss', function () {
  if (!args.dist) {
    gulp.watch([
      config.app + '/**/*.scss',
      config.vendorFiles.scss.files
    ], [
      'scss:build'
    ]);
  }
});
