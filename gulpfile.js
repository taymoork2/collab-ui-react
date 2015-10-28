'use strict';

/* global __dirname */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  lazy: true
});

var sourcemaps = require('gulp-sourcemaps');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var coffee = require('coffee-script/register');
var colors = $.util.colors;
var concat = require('gulp-concat');
var config = require('./gulp.config')();
var del = require('del');
var glob = require('glob');
var hmac = require('crypto-js/hmac-md5');
var karma = require('karma').server;
var log = $.util.log;
var path = require('path');
var pkg = require('./package.json');
var protractor = require('gulp-protractor').protractor;
var fs = require('fs');
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var reload = browserSync.reload;
var runSeq = require('run-sequence');
var uuid = require('uuid');
var testFiles = [];
var changedFiles = [];
var _uuid;

function isLinux() {
  return process.platform === 'linux';
}

function sourceSauce() {
  $.env({
    file: './test/env/sauce.json',
    vars: {
      "SC_TUNNEL_IDENTIFIER": _uuid || (_uuid = uuid.v4())
    }
  });
}

function sourceIntegration() {
  $.env({
    file: './test/env/integration.json'
  });
}

function sourceProduction() {
  $.env({
    file: './test/env/production.json'
  });
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
gulp.task('build', ['clean'], function (done) {
  if (args.nolint) {
    runSeq(
      [
        'template-cache',
        'scss:build',
        'copy:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  } else {
    runSeq(
      'jsb', [
        'template-cache',
        'scss:build',
        'copy:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  }
});

/*********************************************
 * Run tasks for Dist/Production directory
 * Usage: gulp dist
 ********************************************/
gulp.task('dist', ['build'], function (done) {
  runSeq(
    [
      'image-min',
      'copy:dist',
      'optimize',
    ],
    done
  );
});

/*********************************************
 * Installs configured TypeScript definitions
 * Usage: gulp tsd
 ********************************************/

gulp.task('tsd', function (done) {
  $.tsd({
    command: 'reinstall',
    config: './tsd.json'
  }, done);
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
gulp.task('clean:dist', function (done) {
  var files = config.dist;
  messageLogger('Cleaning dist directory', files);
  del(files, done);
});

/*********************************************
 * Delete build directory files
 * Usage: gulp clean:build
 ********************************************/
gulp.task('clean:build', function (done) {
  var files = config.build;
  messageLogger('Cleaning build directory', files);
  del(files, done);
});

/*********************************************
 * Delete build directory files
 * Usage: gulp clean:build
 ********************************************/
gulp.task('clean:karma', function (done) {
  var files = config.test + '/karma*.js';
  messageLogger('Cleaning build directory', files);
  del(files, done);
});

/*********************************************
 * Delete files from individual build sub-directories
 ********************************************/
gulp.task('clean:css', function (done) {
  var files = [
    config.build + 'styles/**/*.css'
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
gulp.task('copy:build', function (done) {
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

gulp.task('copy:build-app-files', function () {
  var files = [].concat(
    config.app + '/*.{ico,png,txt,html}',
    '!index.html',
    config.app + '/' + config.images + '/**/*',
    config.appFiles.js,
    config.appFiles.json,
    config.appFiles.csv,
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

gulp.task('copy:build-unsupported-js', function () {
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

gulp.task('copy:changed-files', function () {
  messageLogger('Copying changed files', changedFiles);
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
    '*.{txt,html}',
    '!index.html',
    '**/*.json',
    '**/*.csv',
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

gulp.task('copy:dist-vendor-fonts', function () {
  messageLogger('Copying vendor fonts files', config.vendorFiles.fonts);
  return gulp
    .src(config.vendorFiles.fonts)
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.dist + '/' + config.fonts));
});

//============================================
// HTML BUILDING TASKS
//============================================

gulp.task('processHtml:build', function (done) {
  runSeq(['index:build', 'unsupported:build'], done);
});

/*********************************************
 * Inject dependancies into index.html
 * Usage: gulp index:build
 ********************************************/
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

//============================================
// IMAGE MINIFICATION TASK
//============================================

/*********************************************
 * Usage: gulp image-min
 ********************************************/
gulp.task('image-min', function () {
  messageLogger('Compressing images for dist');
  gulp.src(config.build + '/**/*.{ico,png,jpg,gif,svg}')
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
gulp.task('jsBeautifier:verify', function () {
  var files = [
    config.app + '/**/*.js',
    config.app + '/**/*.json',
    config.test + '/**/*.js',
    config.test + '/**/*.json',
    '!test/karma-unit.js',
    '!karma.conf.js',
    'gulpfile.js'
  ];
  var logSuccess = args.verbose ? true : false;
  messageLogger('Verifying JS files formatting', files);
  return gulp
    .src(files)
    .pipe($.jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_ONLY',
      logSuccess: logSuccess
    }));
});

gulp.task('jsBeautifier:beautify', function () {
  var files = [
    config.app + '/**/*.js',
    config.app + '/**/*.json',
    config.test + '/**/*.js',
    config.test + '/**/*.json',
    '!test/karma-unit.js',
    '!karma.conf.js',
    'gulpfile.js'
  ];
  var logSuccess = args.verbose ? true : false;
  messageLogger('Formatting JS files', files);
  return gulp
    .src(files, {
      base: './'
    })
    .pipe($.jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE',
      logSuccess: logSuccess
    }))
    .pipe(gulp.dest('./'));
});

//============================================
// CSS TASKS
//============================================

/*********************************************
 * Process SCSS files for the build directory
 * Usage: gulp scss:build
 ********************************************/
gulp.task('scss:build', ['clean:css'], function () {
  messageLogger('Compiling SCSS --> CSS');
  return gulp
    .src('app/styles/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass({
      outputStyle: 'compact',
      includePaths: config.vendorFiles.scss.paths
    }))
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
    .pipe($.sourcemaps.write('/'))
    .pipe(gulp.dest(config.build))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }));
});

//============================================
// OPTIMIZATION TASKS
//============================================

gulp.task('optimize', function (done) {
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
gulp.task('optimize:app', function () {
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
    .pipe($.minifyCss())
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
gulp.task('optimize:unsupported', function () {
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

//============================================
// CODE ANALYZING TASKS
//============================================

/*********************************************
 * vet the code and create coverage report
 ********************************************/

gulp.task('analyze', ['jsBeautifier:beautify'], function (done) {
  messageLogger('Analyzing source with JSHint, JSCS, and Plato');
  runSeq([
    'analyze:jscs',
    'analyze:jshint',
    'plato',
  ], done);
});

gulp.task('analyze:jshint', function () {
  var files = [].concat(
    config.appFiles.js,
    config.unsupportedDir + '/' + config.unsupported.file,
    config.testFiles.spec,
    'gulpfile.js'
  );
  messageLogger('Running JSHint on JavaScript files', files);
  return gulp
    .src(files)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {
      verbose: true
    }))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('analyze:jscs', function () {
  messageLogger('Running JSCS on JavaScript files', config.appFiles.js);
  return gulp
    .src(config.appFiles.js)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .on('error', errorLogger);
});

gulp.task('eslint:e2e', function () {
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
gulp.task('plato', function (done) {
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
gulp.task('serve', function (done) {
  var preTask = args.dist ? 'dist' : 'build';
  runSeq(
    preTask,
    'browser-sync',
    done
  );
});

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
});

//============================================
// UNIT TESTING TASKS
//============================================

/*********************************************
 * Compile the karma template so that changes
 * to its file array aren't managed manually
 * Usage: gulp karma-config
 ********************************************/
gulp.task('karma-config', function (done) {
  if (!args.nounit) {
    var unitTestFiles = [].concat(
      config.vendorFiles.js,
      config.testFiles.js,
      config.testFiles.app,
      config.testFiles.global,
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
        transform: function (filepath, file, i, length) {
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
gulp.task('karma-config-watch', function () {
  var unitTestFiles = [].concat(
    config.vendorFiles.js,
    config.testFiles.js,
    config.testFiles.app,
    config.testFiles.global,
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
      transform: function (filepath, file, i, length) {
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
 * Usage: gulp karma
 *        gulp karma --debug
 ********************************************/
gulp.task('karma', function (done) {
  if (!args.nounit) {
    var options = {
      configFile: __dirname + '/test/karma-unit.js'
    };
    if (args.debug) {
      options.browsers = ['Chrome'];
      options.preprocessors = {};
      options.browserNoActivityTimeout = 600000;
    } else {
      options.singleRun = true;
    }
    karma.start(options, done);
  } else {
    log($.util.colors.red('--nounit **Skipping Karma Tests'));
    return done();
  }
});

/*********************************************
 * Run test once and exit
 * Usage: gulp karma-watch
 ********************************************/
gulp.task('karma-watch', ['karma-config-watch'], function (done) {
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
 * --sauce              Runs tests against SauceLabs
 * --int                Runs tests against integration atlas
 * --prod               Runs tests against production atlas
 * --nosetup            Runs tests without serving the app
 * --specs              Runs tests against specific files or modules
 * --build              Runs tests against the build directory
 * --verbose            Runs tests with detailed console.log() messages
 *************************************************************************/
gulp.task('e2e', function (done) {
  if (args.sauce) {
    runSeq(
      'e2e:setup',
      'sauce:start',
      'protractor',
      done
    );
  } else {
    runSeq(
      'e2e:setup',
      'protractor',
      done
    );
  }
});

/*************************************************************************
 * E2E testing task
 * Usage: gulp protractor   Runs tests against the dist directory
 * Options:
 * --specs=squared          Runs only tests in test/squared directory
 * --specs=huron            Runs only tests in test/huron directory
 * --specs=hercules         Runs only tests in test/hercules directory
 * --specs=mediafusion      Runs only tests in test/mediafusion directory
 * --specs=filepath         Runs only tests in specified file
 * --specs=fromfile         Runs only tests from within a file
 * --filename=filepath      Specify the filename
 * --build                  Runs tests against the build directory
 * --verbose                Runs tests with detailed console.log() messages
 *************************************************************************/
gulp.task('protractor', ['set-env', 'protractor:update'], function () {
  var debug = args.debug ? true : false;
  var opts = {
    configFile: 'protractor-config.js',
    noColor: false,
    debug: debug,
    args: ['--params.log', args.verbose ? 'true' : 'false']
  };

  var tests = [];
  if (args.specs) {
    var specs = args.specs;
    if (specs === 'fromfile') {
      if (args.filename) {
        var filename = args.filename;
        try {
          var e2ePrTests = fs.readFileSync('./' + filename, "utf8");
          tests = e2ePrTests.split('\n');
          tests = tests.filter(function (test) {
            return test.trim() !== '';
          });
          messageLogger('Running End 2 End tests from file: ' + $.util.colors.red(specs));
        } catch (err) {
          messageLogger('Error:: ' + $.util.colors.red(err));
        }
      } else {
        messageLogger('Error:: ' + $.util.colors.red("'--filename' is not specified."));
      }
    } else if (!specs.match(/_spec.js/)) {
      tests = 'test/e2e-protractor/' + specs + '/**/*_spec.js';
      messageLogger('Running End 2 End tests from module: ' + $.util.colors.red(specs));
      // log($.util.colors.green('Running End 2 End tests from module: ') + $.util.colors.red(specs));
    } else {
      tests = specs.split(',');
      messageLogger('Running End 2 End tests from file: ' + $.util.colors.red(specs));
      // log($.util.colors.green('Running End 2 End tests from file: ') + $.util.colors.red(specs));
    }
  } else {
    // tests = 'test/e2e-protractor/**/*_spec.js';
    tests = [].concat(
      config.testFiles.e2e.squared,
      config.testFiles.e2e.hercules,
      config.testFiles.e2e.sunlight,
      config.testFiles.e2e.webexuser,
      config.testFiles.e2e.webexsite
    );
    messageLogger('Running End 2 End tests from all modules.');
  }

  /*
   * process.exit() instead of server.close()
   * $.connect.serverClose() can't be relied on to end sockets
   */
  function exit(exitCode) {
    if (args.sauce) {
      $.run('./sauce/stop.sh').exec('', function () {
        process.nextTick(function () {
          process.exit(exitCode);
        });
      });
    } else {
      process.nextTick(function () {
        process.exit(exitCode);
      });
    }
  }

  return gulp.src(tests)
    .pipe(protractor(opts))
    .on('error', function (e) {
      exit(1);
    })
    .on('end', function () {
      exit(0);
    });
});

gulp.task('protractor:update', webdriverUpdate);

gulp.task('set-env', function () {
  if (args.sauce) {
    sourceSauce();
  }
  if (args.prod) {
    sourceProduction();
  } else if (args.int) {
    sourceIntegration();
  }
});

//============================================
// SAUCELABS TASKS
//============================================

/*********************************************************
 * Start a sauce connect tunnel for testing a local app
 * Usage: gulp sauce:start
 *********************************************************/

gulp.task('sauce:start', function () {
  sourceSauce();
  return gulp.src('')
    .pipe($.shell('./sauce/start.sh'));
});

/*********************************************************
 * Stop a sauce connect tunnel
 * Usage: gulp sauce:stop
 *********************************************************/

gulp.task('sauce:stop', function () {
  sourceSauce();
  return gulp.src('')
    .pipe($.shell('./sauce/stop.sh'));
});

/*********************************************************
 * Get an authenticated url for sauce job results
 * Usage: gulp sauce:job --http://saucelabs.com/jobs/<id>
 *********************************************************/

gulp.task('sauce:job', function () {
  sourceSauce();
  var arg = process.argv.pop();
  var message = arg.split('/').pop();
  var auth = hmac(message, process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY);
  log(arg.replace('--', '') + '?auth=' + auth);
});

/*********************************************
 * Test and document API perfomance
 ********************************************/
gulp.task('test:api', function () {
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
gulp.task('e2e:setup', function (done) {
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
gulp.task('connect', function () {
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

gulp.task('jsb', function (done) {
  runSeq(
    'jsBeautifier:beautify',
    'analyze:jshint',
    done
  );
});

gulp.task('jsb:verify', function (done) {
  runSeq(
    'jsBeautifier:verify',
    'analyze:jshint',
    done
  );
});

gulp.task('compile', function () {
  log($.util.colors.yellow('*************************************'));
  log($.util.colors.yellow('* The `compile` task is depreciated. '));
  log($.util.colors.green('* Use `gulp dist` instead.'));
  log($.util.colors.yellow('*************************************'));
  gulp.start('dist');
});

gulp.task('server', function () {
  log($.util.colors.yellow('***************************************'));
  log($.util.colors.red('* The `server` task has been deprecated.'));
  log($.util.colors.green('* Use `gulp serve` to start a server.'));
  log($.util.colors.yellow('**************************************'));
  gulp.start('serve');
});

gulp.task('test', function () {
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
  /* jshint validthis:true */
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
