'use strict';

exports.config = {
  // Spec patterns are relative to the location of this config.
  specs: [
    'test/e2e-protractor/*_spec.js'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {'args': ['--disable-extensions']}
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:8000',

  onPrepare: function() {

    var UsersPage = require('./test/e2e-protractor/pages/users.page.js');
    var Navigation = require('./test/e2e-protractor/pages/navigation.page.js');
    var LoginPage = require('./test/e2e-protractor/pages/login.page.js');
    var HomePage = require('./test/e2e-protractor/pages/home.page.js');
    var ManagePage = require('./test/e2e-protractor/pages/manage.page.js');
    var ReportsPage = require('./test/e2e-protractor/pages/reports.page.js');

    global.users = new UsersPage();
    global.navigation = new Navigation();
    global.login = new LoginPage();
    global.home = new HomePage();
    global.manage = new ManagePage();
    global.reports = new ReportsPage();

    global.utils = require('./test/e2e-protractor/utils/test.utils.js');
    global.deleteUtils = require('./test/e2e-protractor/utils/delete.utils.js');
    global.config = require('./test/e2e-protractor/utils/test.config.js');
/*
    var ScreenShotReporter = require('protractor-screenshot-reporter');
    var path = require('path');
    jasmine.getEnv().addReporter(new ScreenShotReporter({
      baseDirectory: '/tmp/screenshots',
      takeScreenShotsOnlyForFailedSpecs: true,
      pathBuilder: function(spec, descriptions, results, capabilities) {
        return path.join(capabilities.caps_.browserName, descriptions.join('-'));
      }
    }));
*/
    browser.driver.manage().window().maximize();
  },

  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: true,
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  },

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: 30000
};
