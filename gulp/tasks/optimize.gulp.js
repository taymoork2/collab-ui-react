/**
 * Create Optimized files for distribution
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var messageLogger = require('../utils/messageLogger.gulp')();
var pkg = require('../../package.json');
var runSeq = require('run-sequence');

gulp.task('optimize', function (done) {
  runSeq(
    [
      'optimize:app',
      'optimize:unsupported'
    ],
    done
  );
});

// Optimize app files
gulp.task('optimize:app', function () {
  messageLogger('Optimizing the JavaScript, CSS, and HTML for production index.html');
  var assets = $.useref.assets({
    searchPath: config.build
  });
  var cssFilter = $.filter('**/*.css', {
    restore: true
  });
  var jsFilter = $.filter('**/*.js', {
    restore: true
  });
  var ngOpts = {
    remove: false,
    add: true,
    single_quotes: true
  };
  return gulp
    .src(config.build + '/index.html')
    .pipe($.plumber())
    .pipe(assets)
    .pipe($.sourcemaps.init())
    .pipe(cssFilter)
    .pipe($.minifyCss())
    .pipe(cssFilter.restore)
    .pipe(jsFilter)
    .pipe($.ngAnnotate({
      add: true
    }))
    .pipe($.uglify({
      mangle: false
    }))
    .pipe(jsFilter.restore)
    .pipe($.header(config.banner, {
      pkg: pkg
    }))
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist));
});

// Optimize unsupported files
gulp.task('optimize:unsupported', function () {
  messageLogger('Optimizing the JavaScript, CSS, and HTML for production unsupported.html');
  var assets = $.useref.assets({
    searchPath: config.build
  });
  var jsFilter = $.filter('**/*.js', {
    restore: true
  });

  return gulp
    .src(config.build + '/unsupported.html')
    .pipe($.plumber())
    .pipe(assets)
    .pipe($.sourcemaps.init())
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore)
    .pipe($.header(config.banner, {
      pkg: pkg
    }))
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist));
});
