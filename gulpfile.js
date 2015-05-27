'use strict';

/* global __dirname */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  lazy: true
});
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var coffee = require('coffee-script/register');
var colors = $.util.colors;
var concat = require('gulp-concat');
var config = require('./gulp.config')();
var del = require('del');
var glob = require('glob');
var karma = require('karma').server;
var log = $.util.log;
var path = require('path');
var pkg = require('./package.json');
var protractor = require('gulp-protractor').protractor;
var reload = browserSync.reload;
var runSeq = require('run-sequence');
var testFiles = [];
var changedFiles = [];

function isLinux() {
  return process.platform === 'linux';
}

//============================================
// GULP MAIN TASKS
//============================================

/*********************************************
 * Default gulp task
 * Usage: gulp
 ********************************************/
gulp.task('default', ['help']);

/*********************************************
 * List all of the available gulp tasks
 * Usage: gulp help
 ********************************************/
gulp.task('help', $.taskListing);

/*********************************************
 * Run tasks for Build/Development directory
 * Usage: gulp build
 ********************************************/
gulp.task('build', ['clean'], function(done) {
  runSeq(
    [
      'template-cache',
      'analyze:jshint',
      'less:build',
      'copy:build'
    ],
    'processHtml:build',
    'karma-config',
    'karma-continuous',
    done
  );
});

/*********************************************
 * Run tasks for Dist/Production directory
 * Usage: gulp dist
 ********************************************/
gulp.task('dist', ['build'], function(done) {
  runSeq(
    [
      'image-min',
      'copy:dist',
      'optimize',
    ],
    done
  );
});

//============================================
// CLEANING TASKS
//============================================

/*********************************************
 * Delete build and dist directory files
 * Usage: gulp clean
 ********************************************/
gulp.task('clean', ['clean:build', 'clean:dist', 'clean:karma']);

/*********************************************
 * Delete dist directory files
 * Usage: gulp clean:dist
 ********************************************/
gulp.task('clean:dist', function(done) {
  var files = config.dist;
  messageLogger('Cleaning dist directory', files);
  del(files, done);
});

/*********************************************
 * Delete build directory files
 * Usage: gulp clean:build
 ********************************************/
gulp.task('clean:build', function(done) {
  var files = config.build;
  messageLogger('Cleaning build directory', files);
  del(files, done);
});

/*********************************************
 * Delete build directory files
 * Usage: gulp clean:build
 ********************************************/
gulp.task('clean:karma', function(done) {
  var files = config.test + '/karma*.js';
  messageLogger('Cleaning build directory', files);
  del(files, done);
});

/*********************************************
 * Delete files from individual build sub-directories
 ********************************************/
gulp.task('clean:css', function(done) {
  var files = [
    config.build + '/**/*.css'
  ];
  messageLogger('Cleaning CSS files', files);
  del(files, done);
});

//============================================
// COPY TASKS
//============================================

/*********************************************
 * Copy files for the build directory
 * Usage: gulp copy:build
 ********************************************/
gulp.task('copy:build', function(done) {
  messageLogger('Copying Build Files');
  runSeq([
      'copy:build-app-files',
      'copy:build-unsupported-js',
      'copy:build-vendor-css',
      'copy:build-vendor-fonts',
      'copy:build-vendor-images',
      'copy:build-vendor-js'
    ],
    done);
});

gulp.task('copy:build-app-files', function() {
  var files = [].concat(
    config.app + '/*.{ico,png,txt,html}',
    '!index.html',
    config.app + '/' + config.images + '/**/*',
    config.appFiles.js,
    config.appFiles.json,
    config.app + '/.htaccess'
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

gulp.task('copy:build-unsupported-js', function() {
  messageLogger('Copying unsupported JS files', config.unsupported.js);
  return gulp
    .src(config.unsupported.js, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-css', function() {
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

gulp.task('copy:build-vendor-fonts', function() {
  messageLogger('opying vendor Font files', config.vendorFiles.fonts);
  return gulp
    .src(config.vendorFiles.fonts)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.fonts))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-images', function() {
  messageLogger('Copying vendor Image files', config.vendorFiles.images);
  return gulp
    .src(config.vendorFiles.images)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build + '/' + config.images))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('copy:build-vendor-js', function() {
  messageLogger('Copying vendor CSS files', config.vendorFiles.js);
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

gulp.task('copy:changed-js', function() {
  messageLogger('Copying changed JS files', changedFiles);
  return gulp
    .src(changedFiles, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

/*********************************************
 * Copy files for the dist directory
 * Usage: gulp copy:dist
 ********************************************/
gulp.task('copy:dist', function(done) {
  runSeq([
      'copy:dist-appfiles',
      'copy:dist-vendor-fonts'
    ],
    done
  );
});

gulp.task('copy:dist-appfiles', function() {
  var files = [].concat(
    '*.{txt,html}',
    '!index.html',
    '!index2.html',
    '**/*.json',
    '.htaccess'
  );
  messageLogger('Copying application files', files);
  return gulp
    .src(files, {
      cwd: config.build
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.dist));
});

gulp.task('copy:dist-vendor-fonts', function() {
  messageLogger('Copying vendor fonts files', config.vendorFiles.fonts);
  return gulp
    .src(config.vendorFiles.fonts)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.dist + '/' + config.fonts));
});

//============================================
// HTML BUILDING TASKS
//============================================

gulp.task('processHtml:build', function(done) {
  runSeq(['index:build', 'unsupported:build'], done);
});

/*********************************************
 * Inject dependancies into index.html
 * Usage: gulp index:build
 ********************************************/
gulp.task('index:build', function() {
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
    .src(config.app + '/index2.html')
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

/*********************************************
 * Inject dependancies into unsupported.html
 * Usage: gulp unsupported:build
 ********************************************/
gulp.task('unsupported:build', function() {
  var jsFiles = [].concat(
    config.vendorFiles.unsupported,
    config.unsupportedDir + '/scripts/**/*.js'
  );
  messageLogger('njecting dependancies into unsupported.html', jsFiles);
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

//============================================
// IMAGE MINIFICATION TASK
//============================================

/*********************************************
 * Usage: gulp image-min
 ********************************************/
gulp.task('image-min', function() {
  messageLogger('Compressing images for dist');
  gulp.src(config.build + '/**/*.{ico,png,jpg,gif}')
    .pipe($.imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(config.dist));
});

//============================================
// JAVASCRIPT BEAUTIFYING TASKS
//============================================

/*********************************************
 * Esure code styles are up to par and there
 * are no obvious mistakes
 * Usage:
 * gulp format-js-verify
 * gulp format-js
 ********************************************/
gulp.task('jsBeautifier:verify', function() {
  var files = [
    config.app + '/**/*.js',
    config.app + '/**/*.json',
    config.test + '/**/*.js',
    config.test + '/**/*.json',
    '!test/karma-unit.js',
    'karma.conf.js',
    'Gruntfile.js'
  ];
  messageLogger('Verifying JS files formatting', files);
  return gulp
    .src(files)
    .pipe($.jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_ONLY'
    }));
});

gulp.task('jsBeautifier:beautify', function() {
  var files = [
    config.app + '/**/*.js',
    config.app + '/**/*.json',
    config.test + '/**/*.js',
    config.test + '/**/*.json',
    '!test/karma-unit.js',
    'karma.conf.js',
    'Gruntfile.js'
  ];
  messageLogger('Formatting JS files', files);
  return gulp
    .src(files, {
      base: './'
    })
    .pipe($.jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE',
      logSuccess: false
    }))
    .pipe(gulp.dest('./'));
});

//============================================
// LESS TASKS
//============================================

/*********************************************
 * Process LESS files for the build directory
 * Usage: gulp less:build
 ********************************************/
gulp.task('less:build', ['clean:css'], function() {
  messageLogger('Compiling LESS --> CSS');
  return gulp
    .src('app/styles/app.less')
    .pipe($.plumber())
    .pipe($.less())
    .on('error', errorLogger)
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', '> 5%']
    }))
    .pipe($.rename({
      dirname: 'styles/',
      basename: config.cssName,
      extname: '.css'
    }))
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

//============================================
// OPTIMIZATION TASKS
//============================================

gulp.task('optimize', function(done) {
  runSeq(
    [
      'optimize:app',
      'optimize:unsupported'
    ],
    done
  );
});

/*********************************************
 * Optimize files for production/dist
 * Usage: gulp optimize:app
 ********************************************/
gulp.task('optimize:app', function() {
  messageLogger('Optimizing the JavaScript, CSS, and HTML for production index.html');
  var assets = $.useref.assets({
    searchPath: config.build
  });
  var cssFilter = $.filter('**/*.css');
  var jsFilter = $.filter('**/*.js');
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
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(jsFilter)
    .pipe($.ngAnnotate({
      add: true
    }))
    .pipe($.uglify({
      mangle: false
    }))
    .pipe(jsFilter.restore())
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

/*********************************************
 * Optimize files for production/dist
 * Usage: gulp optimize:unsupported
 ********************************************/
gulp.task('optimize:unsupported', function() {
  messageLogger('Optimizing the JavaScript, CSS, and HTML for production unsupported.html');
  var assets = $.useref.assets({
    searchPath: config.build
  });
  var jsFilter = $.filter('**/*.js');

  return gulp
    .src(config.build + '/unsupported.html')
    .pipe($.plumber())
    .pipe(assets)
    .pipe($.sourcemaps.init())
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
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

//============================================
// TEMPLATE CACHING TASK
//============================================

/*********************************************
 * Compile all template files and places them
 * into JavaScript files as strings that are
 * added to Angular's template cache.
 * Usage: gulp template-cache
 ********************************************/
gulp.task('template-cache', function() {
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

//============================================
// CODE ANALYZING TASKS
//============================================

/*********************************************
 * vet the code and create coverage report
 ********************************************/

gulp.task('analyze', ['jsBeautifier:beautify'], function(done) {
  messageLogger('Analyzing source with JSHint, JSCS, and Plato');
  runSeq([
    'analyze:jscs',
    'analyze:jshint',
    'plato',
  ], done);
});

gulp.task('analyze:jshint', function() {
  var files = [].concat(
    config.appFiles.js,
    config.testFiles.spec
  );
  messageLogger('Running JSHint on JavaScript files', files);
  return gulp
    .src(files)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jshint());
  // .pipe($.jshint.reporter('jshint-stylish', {
  //   verbose: true
  // }))
  // .pipe($.jshint.reporter('fail'));
});

gulp.task('analyze:jscs', function() {
  messageLogger('Running JSCS on JavaScript files', config.appFiles.js);
  return gulp
    .src(config.appFiles.js)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .on('error', errorLogger);
});

gulp.task('eslint:e2e', function() {
  var files = [].concat(
    config.test + '/e2e-protractor/squared/*_spec.js',
    config.test + '/e2e-protractor/huron/*_spec.js'
  );
  messageLogger('Running eslint on E2E test files', files);
  return gulp
    .src(files)
    .pipe($.eslint({
      configFile: 'config/eslint.json',
      rulePaths: ['config/rules']
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

/*********************************************
 * Create a visualizer report
 ********************************************/
gulp.task('plato', function(done) {
  messageLogger('Analyzing source with Plato');
  log('Browse to /report/plato/index.html to see Plato results');
  startPlatoVisualizer(done);
});

//============================================
// SERVE AND BROWSERSYNC
//============================================

/*********************************************
 * Usage: gulp serve
 ********************************************/
gulp.task('serve', function(done) {
  var preTask = args.dist ? 'dist' : 'build';
  runSeq(
    preTask,
    'browser-sync',
    done
  );
});

gulp.task('browser-sync', function() {
  if (browserSync.active) {
    return;
  }
  var browser;
  var baseDir = args.dist ? config.dist : config.build;
  var open = true;
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
        '**/*.less',
      ], [
        'less:build'
      ])
      .on('change', logWatch);

    if (args.nounit) {
      gulp.watch([
          config.appFiles.js
        ], [
          'copy:changed-js',
          'index:build'
        ])
        .on('change', logWatch);
    } else {
      gulp.watch([
          config.appFiles.js
        ], [
          'karma-watch',
          'copy:changed-js',
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
  }

  function logWatch(event) {
    messageLogger('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    var path = event.path;
    var pathArray = path.split('/');
    var appIndex = pathArray.indexOf('modules') + 1;
    var parentIndex = pathArray.length - 1;
    var parentDirectory = pathArray.slice(appIndex, parentIndex).join('/');
    testFiles = ['test/' + parentDirectory + '/**.spec.js', 'src/app/**/' + parentDirectory + '/**.spec.js'];
    changedFiles = path;
  }
});

//============================================
// UNIT TESTING TASKS
//============================================

/*********************************************
 * Compile the karma template so that changes
 * to its file array aren't managed manually
 * Usage: gulp karma-config
 ********************************************/
gulp.task('karma-config', function(done) {
  if (!args.nounit) {
    var unitTestFiles = [].concat(
      config.vendorFiles.js,
      config.testFiles.js,
      config.testFiles.app,
      config.testFiles.spec
    );

    return gulp
      .src(config.testFiles.karmaTpl)
      .pipe($.inject(gulp.src(unitTestFiles, {
        read: false
      }), {
        addRootSlash: false,
        starttag: 'files: [',
        endtag: ',',
        transform: function(filepath, file, i, length) {
          return '\'' + filepath + '\'' + (i + 1 < length ? ',' : '');
        }
      }))
      .pipe($.rename({
        basename: 'karma-unit',
        extname: '.js'
      }))
      .pipe($.jsbeautifier({
        config: '.jsbeautifyrc',
        mode: 'VERIFY_AND_WRITE',
        logSuccess: false
      }))
      .pipe(gulp.dest(config.test));
  } else {
    log($.util.colors.red('--nounit **Skipping Karma Config Task'));
    return done();
  }
});

/*********************************************
 * Compile the karma template so that changes
 * with the test files of the changed directory
 * Usage: gulp karma-config-watch
 ********************************************/
gulp.task('karma-config-watch', function() {
  var unitTestFiles = [].concat(
    config.vendorFiles.js,
    config.testFiles.js,
    config.testFiles.app,
    testFiles
  );

  return gulp
    .src(config.testFiles.karmaTpl)
    .pipe($.inject(gulp.src(unitTestFiles, {
      read: false
    }), {
      addRootSlash: false,
      starttag: 'files: [',
      endtag: ',',
      transform: function(filepath, file, i, length) {
        return '\'' + filepath + '\'' + (i + 1 < length ? ',' : '');
      }
    }))
    .pipe($.rename({
      basename: 'karma-watch',
      extname: '.js'
    }))
    .pipe(gulp.dest(config.test));
});

/*********************************************
 * Run test once and exit
 * Usage: gulp karma-continuous
 ********************************************/
gulp.task('karma-continuous', function(done) {
  if (!args.nounit) {
    karma.start({
      configFile: __dirname + '/test/karma-unit.js',
      singleRun: true
    }, done);
  } else {
    log($.util.colors.red('--nounit **Skipping Karma Tests'));
    return done();
  }
});

/*********************************************
 * Run test once and exit
 * Usage: gulp karma-watch
 ********************************************/
gulp.task('karma-watch', ['karma-config-watch'], function(done) {
  karma.start({
    configFile: __dirname + '/test/karma-watch.js',
    singleRun: true
  }, done);
});

//============================================
// E2E TESTING TASKS
//============================================

/*************************************************************************
 * E2E testing task
 * Usage: gulp e2e      Runs tests against the dist directory
 * Options:
 * --specs=squared      Runs only tests in test/squared directory
 * --specs=huron        Runs only tests in test/huron directory
 * --specs=hercules     Runs only tests in test/hercules directory
 * --specs=mediafusion  Runs only tests in test/mediafusion directory
 * --specs=filepath     Runs only tests in specified file
 * --build              Runs tests against the build directory
 *************************************************************************/
gulp.task('e2e', ['e2e:setup'], function() {
  var debug = args.debug ? true : false;
  var opts = {
    configFile: 'protractor-config.js',
    noColor: false,
    debug: debug
  };
  var tests = [];
  if (args.specs) {
    var specs = args.specs;
    if (!specs.match(/_spec.js$/)) {
      tests = 'test/e2e-protractor/' + specs + '/**/*_spec.js';
      messageLogger('Running End 2 End tests from module' + $.util.colors.red(specs));
      // log($.util.colors.green('Running End 2 End tests from module: ') + $.util.colors.red(specs));
    } else {
      tests = specs;
      messageLogger('Running End 2 End tests from file:' + $.util.colors.red(specs));
      // log($.util.colors.green('Running End 2 End tests from file: ') + $.util.colors.red(specs));
    }
  } else {
    tests = 'test/e2e-protractor/**/*_spec.js';
    // tests = [].concat(
    //     config.testFiles.e2e.spark,
    //     config.testFiles.e2e.hercules,
    //     config.testFiles.e2e.mediafusion
    //   );
    messageLogger('Running End 2 End tests from all modules.');
  }

  gulp.src(tests)
    .pipe(protractor(opts))
    .on('error', function(e) {
      $.connect.serverClose();
      throw e;
    })
    .on('end', function() {
      $.connect.serverClose();
    });
});

/*********************************************
 * Test and document API perfomance
 ********************************************/
gulp.task('test:api', function() {
  var opts = {
    reporter: 'spec',
    timeout: 30000,
    'async-only': true
  };

  return gulp
    .src(['test/api_sanity/**/*_test.coffee'], {
      read: false
    })
    .pipe($.mocha(opts));
});

/*********************************************
 * E2E Setup tasks
 ********************************************/
gulp.task('e2e:setup', function(done) {
  var buildTask = args.build ? 'build' : 'dist';
  if (!args.nosetup) {
    runSeq(
      'test:api',
      buildTask,
      'eslint:e2e',
      'connect',
      done
    );
  } else {
    log($.util.colors.red('--nosetup **Skipping E2E Setup Tasks.'));
    return done();
  }
});

/*********************************************
 * Connect server for E2E Tests
 ********************************************/
gulp.task('connect', function() {
  var rootDir = args.build ? config.build : config.dist;
  messageLogger('Connecting server from the ' + rootDir + ' directory.');
  $.connect.server({
    root: [config.test, rootDir],
    port: 8000,
    livereload: false
  });
});

//============================================
// GRUNT ALIASES
//============================================

gulp.task('jsb', ['jsBeautifier:beautify']);

gulp.task('compile', function() {
  log($.util.colors.yellow('*************************************'));
  log($.util.colors.yellow('* The `compile` task is depreciated. '));
  log($.util.colors.green('* Use `gulp dist` instead.'));
  log($.util.colors.yellow('*************************************'));
  gulp.start('dist');
});

gulp.task('server', function() {
  log($.util.colors.yellow('***************************************'));
  log($.util.colors.red('* The `server` task has been deprecated.'));
  log($.util.colors.green('* Use `gulp serve` to start a server.'));
  log($.util.colors.yellow('**************************************'));
  gulp.start('serve');
});

gulp.task('test', function() {
  log($.util.colors.yellow('*****************************************'));
  log($.util.colors.red('* The `test` task has been deprecated.'));
  log($.util.colors.green('* Use `gulp e2e` to run functional tests.'));
  log($.util.colors.yellow('*****************************************'));
  gulp.start('e2e');
});

/////////////////////////////
/////////////////////////////

// Log an error message and emit the end of a task
function errorLogger(error) {
  log($.util.colors.red('*** Start of Error ***'));
  log(error);
  log($.util.colors.red('*** End of Error ***'));
  this.emit('end');
}

// Start Plato inspector and visualizer
function startPlatoVisualizer(done) {
  messageLogger('Running Plato');
  var files = glob.sync('app/**/*.js');
  var excludeFiles = /.*\.spec\.js/;
  var plato = require('plato');
  var options = {
    title: 'Plato Inspections Report',
    exclude: excludeFiles
  };
  var outputDir = 'plato';
  plato.inspect(files, outputDir, options, platoCompleted);

  function platoCompleted(report) {
    var overview = plato.getOverviewReport(report);
    if (args.verbose) {
      log(overview.summary);
    }
    if (done) {
      done();
    }
  }
}

function messageLogger(message, files) {
  if (args.verbose && files) {
    log(message + ': ' + $.util.colors.green(files));
  } else {
    log($.util.colors.green(message));
  }
}
