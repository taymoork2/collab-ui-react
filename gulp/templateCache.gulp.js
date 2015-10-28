/**
 * TEMPLATE CACHING TASK
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('./messageLogger.gulp')();

// Compile all template files and places them into
// JavaScript files as strings that are added to
// Angular's template cache.
gulp.task('template-cache', function () {
  messageLogger('Creating Angular $templatecache');
  return gulp.src(config.appFiles.tpl)
    .pipe($.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options))
    .pipe(gulp.dest(config.templateCache.dest))
    .pipe(reload({
      stream: true
    }));
});

