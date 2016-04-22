/**
 * HTML BUILDING TASKS
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
var series = require('stream-series');
var fs = require('fs');

gulp.task('processHtml:build', function (done) {
  runSeq(['index:build', 'unsupported:build'], done);
});


// Inject dependancies into index.html
gulp.task('index:build', function () {
  var jsFiles = [].concat(
    config.vendorFiles.js,
    config.build + '/scripts/**/*.js',
    '!' + config.build + '/scripts/**/*.ts.js',
    config.build + '/modules/**/*module.js',
    '!' + config.build + '/modules/**/*module.ts.js',
    config.build + '/modules/**/*.js',
    '!' + config.build + '/modules/**/*.ts.js'
  );
  var cssFiles = [].concat(
    config.vendorFiles.css,
    config.build + '/' + config.css + '/' + config.cssName + '.css'
  );

  var addTsFilesFromManifest = function (fileList) {
    fileList = fileList || [];
    var fileContent = fs.readFileSync(config.build + '/' + config.tsManifest, /*config.build+"/ts-manifest.txt",*/ "utf8");
    var fileSplit = fileContent.split(/\r?\n/);
    // fileList.push('/Users/maholst/Documents/wx2-admin-web-client/build/modules/core/domainManagement/domainManageAddCtrl.ts.js');
    fileList = fileList.concat(fileSplit);

    // fileContent = fs.readFileSync(config.tsTestManifest+'')


    return fileList;
    //return gulp.src('!' + config.build + '/modules/**/*.ts.js');
  };
  var tsManinfest = [].concat(config.build + '/ts-manifest.txt');
  messageLogger('Injecting dependancies into index.html', jsFiles + ', ' + cssFiles);
  return gulp
    .src(config.app + '/index.html')
    .pipe($.if(args.verbose, $.print()))
    .pipe($.inject(series(gulp.src(jsFiles, {
      read: false
    }), gulp.src(addTsFilesFromManifest([]), {read: false})), {
      ignorePath: config.build,
      addRootSlash: false
    }))

    // .pipe(gulp.src(tsManinfest))
    // .pipe(addTsFilesFromManifest())
    // .pipe($.inject(
    //   // addTsFilesFromManifest(),
    //   gulp.src(addTsFilesFromManifest([]), {
    //   read: false
    // }),
    //   {
    //   ignorePath: config.build,
    //   addRootSlash: false
    // }))

    .pipe($.inject(gulp.src(cssFiles, {
      read: false
    }), {
      ignorePath: config.build,
      addRootSlash: false
    }))
    .pipe($.inject(gulp.src(config.app + '/**/unsupported.js', {
      read: false
    }), {
      starttag: '<!-- unsupported:{{ext}} -->',
      ignorePath: config.app,
      addRootSlash: false
    }))
    .pipe($.rename('index.html'))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

// Inject dependancies into unsupported.html
gulp.task('unsupported:build', function () {
  var jsFiles = [].concat(
    config.vendorFiles.unsupported,
    config.unsupportedDir + '/scripts/**/*.js'
  );
  messageLogger('Injecting dependancies into unsupported.html', jsFiles);
  return gulp
    .src(config.unsupportedDir + '/unsupported2.html')
    .pipe($.if(args.verbose, $.print()))
    .pipe($.inject(gulp.src(jsFiles, {
      read: false
    }), {
      ignorePath: config.build,
      addRootSlash: false
    }))
    .pipe($.rename('unsupported.html'))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});
