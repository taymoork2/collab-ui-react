/**
 * Installs configured TypeScript definitions
 */
'use strict';

 var gulp = require('gulp');
 var config = require('../gulp.config')();
 var tsd = require('gulp-tsd');

gulp.task('tsd', function (done) {
  tsd({
    command: 'reinstall',
    config: './tsd.json'
  }, done);
});

