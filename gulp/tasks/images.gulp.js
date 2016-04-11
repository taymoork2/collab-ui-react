/**
 * IMAGE MINIFICATION TASK
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var messageLogger = require('../utils/messageLogger.gulp')();

gulp.task('image-min', function (done) {
  messageLogger('Compressing images for dist');
  gulp.src(config.build + '/**/*.{ico,png,jpg,gif}')
    .pipe($.imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(config.dist))
    .on('end', done);
});
