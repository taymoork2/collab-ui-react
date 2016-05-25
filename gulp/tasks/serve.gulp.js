/**
 * SERVE AND BROWSERSYNC
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var messageLogger = require('../utils/messageLogger.gulp')();
var reload = browserSync.reload;
var runSeq = require('run-sequence');
var compression = require('compression');
var contentSecurityPolicy = require('helmet-csp');
var notifier = require('node-notifier');
var openBrowser = require('open');
var testFiles;
var changedFiles;

// Serve
gulp.task('serve', function (done) {
  var preTask = args.dist ? 'dist' : 'build';
  runSeq(
    preTask,
    'watch',
    'browser-sync',
    done
  );
});

gulp.task('watch-serve', function (done) {
  runSeq('watch', 'browser-sync', done);
});

// BrowserSync
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

  var imagePreloadScriptSHA1 = '\'sha256-x+aZvuBn2wT79r4ro+BTMYyQJwOC/JIXRDq4dE+tp9k=\'';
  var browserSyncScriptSHA1 = '\'sha256-X3L99Fr8H4ZuITyUqIoiId5vHqXaiAp/3oicgoII6sc=\'';
  var options = {
    host: '127.0.0.1',
    port: 8000,
    server: {
      baseDir: baseDir,
      middleware: [
        compression(),
        {
          route: '/report-violation',
          handle: function (req, res, next) {
            if (req.method === 'POST') {
              var chunks = '';
              req.on('data', function(chunk) {
                chunks = chunks + chunk;
              });
              req.on('end', function() {
                var report = JSON.parse(chunks)['csp-report'];
                notifier.notify({
                  title: 'CSP violation',
                  subtitle: 'You violated ' + report['effective-directive'],
                  message: 'Blocked URI:' + report['blocked-uri'],
                  icon: 'http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/01/01f7232ab1dd5845a83b18ae92552a188ec0530d_full.jpg',
                  contentImage: 'http://memesvault.com/wp-content/uploads/Nooo-Meme-04.jpg',
                  wait: true
                });
                notifier.on('click', function (notifierObject, options) {
                  openBrowser('http://www.google.com');
                });
                res.writeHead(200, 'OK', {
                  'Content-Type': 'text/html'
                });
                res.end();
              });
            } else {
              next();
            }
          }
        },
        contentSecurityPolicy({
          reportOnly: false,
          browserSniff: false,
          directives: {
            defaultSrc: ['\'self\'', '*.statuspage.io', '*.webex.com', '*.wbx2.com', '*.localytics.com', '*.webexconnect.com'],
            connectSrc: ['\'self\'', '*.cisco.com', '*.huron-int.com', '*.huron.uno', '*.huron-dev.com', '*.ciscoccservice.com', '*.statuspage.io', '*.webex.com', '*.wbx2.com', '*.webexconnect.com', 'cdn.mxpnl.com', 'api.mixpanel.com', 'ws://127.0.0.1:8000', 'ws://localhost:8000'],
            imgSrc: ['\'self\'', 'data:', '*.localytics.com', '*.rackcdn.com', '*.clouddrive.com'],
            scriptSrc: ['\'self\'', imagePreloadScriptSHA1, browserSyncScriptSHA1, '\'unsafe-eval\'', '*.webex.com', '*.localytics.com', 'cdn.mxpnl.com', 'api.mixpanel.com'],
            styleSrc: ['\'self\'', '\'unsafe-inline\''],
            reportUri: '/report-violation',
          }
        })
      ]
    },
    ghostMode: args.browserall ? ghostMode : false,
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'info',
    logPrefix: 'browser-sync',
    reloadDelay: 1000,
    browser: browser,
    open: args.noopen ? false : open,
  };

  browserSync(options);

  /////////////
  function isLinux() {
    return process.platform === 'linux';
  }
});
