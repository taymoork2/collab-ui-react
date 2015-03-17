'use strict';

exports.config = {
  framework: "jasmine2",

  directConnect: true,

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['--disable-extensions', '--start-fullscreen']
    },
    shardTestFiles: true,
    maxInstances: 1
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://127.0.0.1:8000',

  onPrepare: function() {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmineReporters.JUnitXmlReporter({
        savePath:'test/e2e-protractor/reports',
        consolidateAll: true,
        useDotNotation: true
      })
    );

    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(
      new SpecReporter({
        displayStacktrace: true,
        displaySpecDuration: true
      })
    );

    var ScreenShotReporter = require('protractor-jasmine2-screenshot-reporter');
    jasmine.getEnv().addReporter(
      new ScreenShotReporter({
        dest: './screenshots',
        captureOnlyFailedSpecs: true,
        ignoreSkippedSpecs: true,
        pathBuilder: function(currentSpec) {
          return currentSpec.fullName;
        }
      })
    );

    browser.getCapabilities().then(function (capabilities) {
      if (capabilities.caps_.browserName === 'firefox') {
        browser.driver.manage().window().maximize();
      }
    });

    global.baseUrl = exports.config.baseUrl;

    global.helper = require('./test/api_sanity/test_helper');

    global.utils = require('./test/e2e-protractor/utils/test.utils.js');
    global.deleteUtils = require('./test/e2e-protractor/utils/delete.utils.js');
    global.config = require('./test/e2e-protractor/utils/test.config.js');
    global.deleteTrialUtils = require('./test/e2e-protractor/utils/deleteTrial.utils.js');

    var Navigation = require('./test/e2e-protractor/pages/navigation.page.js');
    var Notifications = require('./test/e2e-protractor/pages/notifications.page.js');
    var UsersPage = require('./test/e2e-protractor/pages/users.page.js');
    var LoginPage = require('./test/e2e-protractor/pages/login.page.js');
    var LandingPage = require('./test/e2e-protractor/pages/landing.page.js');
    var ManagePage = require('./test/e2e-protractor/pages/manage.page.js');
    var ReportsPage = require('./test/e2e-protractor/pages/reports.page.js');
    var SupportPage = require('./test/e2e-protractor/pages/support.page.js');
    var SSOWizardPage = require('./test/e2e-protractor/pages/ssowizard.page.js');
    var DirSyncWizardPage = require('./test/e2e-protractor/pages/dirsync.page.js');
    var InvitePage = require('./test/e2e-protractor/pages/invite.page.js');
    var DownloadPage = require('./test/e2e-protractor/pages/download.page.js');
    var ActivatePage = require('./test/e2e-protractor/pages/activate.page.js');
    var SpacesPage = require('./test/e2e-protractor/pages/spaces.page.js');
    var CallRoutingPage = require('./test/e2e-protractor/pages/callrouting.page.js');
    var PartnerHomePage = require('./test/e2e-protractor/pages/partner.page.js');
    var TelephonyPage = require('./test/e2e-protractor/pages/telephony.page.js');
    var PartnerPage = require('./test/e2e-protractor/pages/partner.page.js');
    var FirstTimeWizard = require('./test/e2e-protractor/pages/wizard.page.js');
    var ServiceSetup = require('./test/e2e-protractor/pages/servicesetup.page.js');
    var RolesPage = require('./test/e2e-protractor/pages/roles.page.js');
    var MeetingsPage = require('./test/e2e-protractor/pages/meetings.page.js');
    var BasicSettigsPage = require('./test/e2e-protractor/pages/webexbasicsettings.page.js');
    var OrgProfilePage = require('./test/e2e-protractor/pages/orgprofile.page.js');


    global.notifications = new Notifications();
    global.navigation = new Navigation();
    global.users = new UsersPage();
    global.login = new LoginPage();
    global.landing = new LandingPage();
    global.manage = new ManagePage();
    global.reports = new ReportsPage();
    global.support = new SupportPage();
    global.ssowizard = new SSOWizardPage();
    global.disyncwizard = new DirSyncWizardPage();
    global.invite = new InvitePage();
    global.download = new DownloadPage();
    global.activate = new ActivatePage();
    global.spaces = new SpacesPage();
    global.callrouting = new CallRoutingPage();
    global.partner = new PartnerHomePage();
    global.telephony = new TelephonyPage();
    global.partner = new PartnerPage();
    global.wizard = new FirstTimeWizard();
    global.servicesetup = new ServiceSetup();
    global.roles = new RolesPage();
    global.meetings = new MeetingsPage();
    global.usersettings = new BasicSettigsPage();
    global.orgprofile = new OrgProfilePage();
  },

  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: true,
    showColors: true,
    print: function() {},
    includeStackTrace: true,
    defaultTimeoutInterval: 40000
  },

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: 40000
};
