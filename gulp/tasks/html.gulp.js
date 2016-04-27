'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');

gulp.task('processHtml:build', function (done) {
  runSeq(['index:build'], done);
});

gulp.task('index:build', function () {
  var jsFiles = [].concat(
    config.vendorFiles.js,
    config.build + '/scripts/**/*.js',
    config.build + '/modules/**/*module.js',
    config.build + '/modules/**/*.js'
  );
  var cssFiles = [].concat(
    config.vendorFiles.css,
    config.build + '/' + config.css + '/' + config.cssName + '.css'
  );
  messageLogger('Injecting dependancies into index.html', jsFiles + ', ' + cssFiles);
  return gulp
    .src(config.app + '/index.html')
    .pipe($.if(args.verbose, $.print()))
    .pipe($.inject(gulp.src(jsFiles, {
      read: false
    }), {
      ignorePath: config.build,
      addRootSlash: false
    }))
    .pipe($.inject(gulp.src(cssFiles, {
      read: false
    }), {
      ignorePath: config.build,
      addRootSlash: false
    }))
    .pipe($.rename('index.html'))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});
