'use strict';

require('babel-register');

/* global jasmine, browser, _ */

var HttpsProxyAgent = require('https-proxy-agent');
var fs = require('fs');
var appConfig = require('./config/config');
var hostnameConfig = require('./app/config/hostname.config');
var processEnvUtil = require('./utils/processEnvUtil')();
var args = require('yargs').argv;
var _ = require('lodash');
var remote = require('selenium-webdriver/remote');
var helper = require('./test/api_sanity/test_helper');

// http proxy agent is required if the host running the 'e2e' task is behind a proxy (ex. a Jenkins slave)
// - sauce executors are connected out to the world through the host's network
// - and at the end of each spec run, a connection back to sauce is made to report results
var agent = mkProxyAgent();

var TIMEOUT = 1000 * 60;
var LONG_TIMEOUT = 1000 * 60 * 2;
var VERY_LONG_TIMEOUT = 1000 * 60 * 5;
var E2E_FAIL_RETRY = appConfig.e2eFailRetry;
var NEWLINE = '\n';
var ANIMATION_DURATION_MS = 300;
var TEST_PARTNER = 'huron-ui-test-partner';

var maxInstances;
if (process.env.SAUCE__MAX_INSTANCES) {
  maxInstances = process.env.SAUCE__MAX_INSTANCES;
} else if (process.env.SAUCE__USERNAME) {
  maxInstances = 10;
} else {
  maxInstances = 1;
}

exports.config = {
  framework: 'jasmine2',

  suites: _.extend({}, appConfig.e2eSuites, {
    jenkins: _.values(appConfig.e2eSuites),
    huron: appConfig.functionalSuites.huron,
  }),

  sauceUser: process.env.SAUCE__USERNAME,
  sauceKey: process.env.SAUCE__ACCESS_KEY,
  sauceAgent: process.env.SAUCE__USERNAME ? agent : undefined,
  directConnect: !process.env.SAUCE__USERNAME,

  capabilities: {
    browserName: 'chrome',
    screenResolution: '1680x1050',
    platform: process.env.SAUCE__USERNAME ? 'Windows 7' : undefined,
    tunnelIdentifier: process.env.SAUCE__TUNNEL_ID,
    name: 'wx2-admin-web-client',
    build: process.env.BUILD_NUMBER,

    chromeOptions: {
      // Get rid of --ignore-certificate yellow warning
      args: ['--disable-extensions', '--window-position=0,0', '--window-size=1280,900', '--no-sandbox', '--test-type=browser'],
      // For completeness setting the download path and avoiding download prompt default on chrome
      prefs: {
        download: {
          prompt_for_download: false,
          directory_upgrade: true,
          default_directory: '/tmp/downloads',
        },
      },
    },
    shardTestFiles: true,
    maxInstances: maxInstances,
  },

  plugins: [{
    package: 'protractor-console-plugin',
    failOnWarning: false, // (Default - false),
    failOnError: false, // (Default - true),
    logWarnings: true, // (Default - true),
    exclude: [ // Array of strings and regex (Default - [])
      /executionContextId/,
      /object Object/,
      /favicon/,
      /\/browser-sync\//,
    ],
  }],

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: getLaunchUrl(args),

  // beforeLaunch A callback function called once configs are read but before
  // any environment setup. This will only run once, and is run before
  // onPrepare. You can specify a file containing code to run by setting
  // beforeLaunch to the filename string.
  beforeLaunch: function () {
    var e2eDeleteOrg = '';
    if (process.env.E2E__ORG_DELETE_TOKENS !== undefined) {
      e2eDeleteOrg = process.env.E2E__ORG_DELETE_TOKENS;
    }
    if (e2eDeleteOrg === TEST_PARTNER) {
      return helper.getBearerToken(e2eDeleteOrg)
        .then(function (token) {
          return helper.deleteAllOrgTokens(token, e2eDeleteOrg);
        });
    }
  },

  onPrepare: function () {
    global._ = require('lodash');
    browser.ignoreSynchronization = true;

    global.isSauce = !!(process.env.SAUCE__USERNAME && process.env.SAUCE__USERNAME.length > 0);
    if (global.isSauce) {
      browser.setFileDetector(new remote.FileDetector());
    }
    global.isProductionBackend = !!args.productionBackend;
    global.log = new Logger();

    global.provisionerKeepCustomer = !!args.provisionerKeepCustomer;

    var jasmineReporters = require('jasmine-reporters');
    var SpecReporter = require('jasmine-spec-reporter');

    global.TIMEOUT = TIMEOUT;
    global.LONG_TIMEOUT = LONG_TIMEOUT;
    global.VERY_LONG_TIMEOUT = VERY_LONG_TIMEOUT;
    global.ANIMATION_DURATION_MS = ANIMATION_DURATION_MS;

    global.getE2eRunCounter = processEnvUtil.getE2eRunCounter;
    global.getE2eRunCounterMax = processEnvUtil.getE2eRunCounterMax;

    global.baseUrl = exports.config.baseUrl;

    global.helper = require('./test/api_sanity/test_helper');
    global.utils = require('./test/e2e-protractor/utils/test.utils.js');
    global.deleteUtils = require('./test/e2e-protractor/utils/delete.utils.js');
    global.createUtils = require('./test/e2e-protractor/utils/create.utils.js');
    global.config = require('./test/e2e-protractor/utils/test.config.js');
    global.aaGetCeUtils = require('./test/e2e-protractor/utils/aaGetCe.utils.js');
    global.deleteTrialUtils = require('./test/e2e-protractor/utils/deleteTrial.utils.js');

    var Navigation = require('./test/e2e-protractor/pages/navigation.page.js');
    var Notifications = require('./test/e2e-protractor/pages/notifications.page.js');
    var UsersPage = require('./test/e2e-protractor/pages/users.page.js');
    var CustomersPage = require('./test/e2e-protractor/pages/customers.page.js');
    var LoginPage = require('./test/e2e-protractor/pages/login.page.js');
    var LandingPage = require('./test/e2e-protractor/pages/landing.page.js');
    var ManagePage = require('./test/e2e-protractor/pages/manage.page.js');
    var ReportsPage = require('./test/e2e-protractor/pages/reports.page.js');
    var SupportPage = require('./test/e2e-protractor/pages/support.page.js');
    var CdrPage = require('./test/e2e-protractor/pages/cdr.page.js');
    var SSOWizardPage = require('./test/e2e-protractor/pages/ssowizard.page.js');
    var DirSyncWizardPage = require('./test/e2e-protractor/pages/dirsync.page.js');
    var DownloadPage = require('./test/e2e-protractor/pages/download.page.js');
    var ActivatePage = require('./test/e2e-protractor/pages/activate.page.js');
    var SpacesPage = require('./test/e2e-protractor/pages/spaces.page.js');
    var AutoAttendantPage = require('./test/e2e-protractor/pages/autoattendant.page.js');
    var PartnerHomePage = require('./test/e2e-protractor/pages/partner.page.js');
    var TelephonyPage = require('./test/e2e-protractor/pages/telephony.page.js');
    var FirstTimeWizard = require('./test/e2e-protractor/pages/wizard.page.js');
    var ServiceSetup = require('./test/e2e-protractor/pages/servicesetup.page.js');
    var RolesPage = require('./test/e2e-protractor/pages/roles.page.js');
    var WebExUserSettingsPage = require('./test/e2e-protractor/pages/webexusersettings.page.js');
    var WebExSiteListPage = require('./test/e2e-protractor/pages/webexsitelist.page.js');
    var WebExSiteSettigsPage = require('./test/e2e-protractor/pages/webexsitesettings.page.js');
    var WebExSiteReportsPage = require('./test/e2e-protractor/pages/webexsitereports.page.js');
    var WebExPage = require('./test/e2e-protractor/pages/webex.page.js');
    var WebExCommon = require('./test/e2e-protractor/pages/webExCommon.page.js');
    var OrgProfilePage = require('./test/e2e-protractor/pages/orgprofile.page.js');
    var MediaServicePage = require('./test/e2e-protractor/pages/mediaService.page.js');
    var EnterpriseResourcePage = require('./test/e2e-protractor/pages/enterpriseResource.page.js');
    var UtilizationPage = require('./test/e2e-protractor/pages/utilization.page.js');
    var MeetingsPage = require('./test/e2e-protractor/pages/meetings.page.js');
    var TrialExtInterestPage = require('./test/e2e-protractor/pages/trialExtInterest.page.js');
    var InviteUsers = require('./test/e2e-protractor/pages/inviteusers.page.js');
    var HuronFeatures = require('./test/e2e-protractor/pages/huronFeatures.page.js');
    var HuntGroup = require('./test/e2e-protractor/pages/HuntGroup.page.js');
    var EnterEmailAddrPage = require('./test/e2e-protractor/pages/enterEmailAddr.page.js');
    var CreateAccountPage = require('./test/e2e-protractor/pages/createAccount.page.js');
    var CareLandingPage = require('./test/e2e-protractor/pages/careLanding.page.js');
    var CareFeatureLandingPage = require('./test/e2e-protractor/pages/careFeatureLanding.page.js');
    var CareChatTemplateSetupPage = require('./test/e2e-protractor/pages/careChatTemplate.page.js');
    var CareVirtualAssistantTemplateSetupPage = require('./test/e2e-protractor/pages/careVirtualAssistantTemplate.page.js');
    var CareSettingsPage = require('./test/e2e-protractor/pages/careSettings.page.js');
    var ManageUsersPage = require('./test/e2e-protractor/pages/manageUsers.page.js');
    var GSSDashboardPage = require('./test/e2e-protractor/pages/gssDashboard.page.js');
    var GSSComponentPage = require('./test/e2e-protractor/pages/gssComponent.page.js');
    var GSSServicePage = require('./test/e2e-protractor/pages/gssService.page.js');
    var GSSIncidentPage = require('./test/e2e-protractor/pages/gssIncident.page.js');
    var OverviewPage = require('./test/e2e-protractor/pages/overview.page.js');

    global.notifications = new Notifications();
    global.navigation = new Navigation();
    global.users = new UsersPage();
    global.customers = new CustomersPage();
    global.login = new LoginPage();
    global.landing = new LandingPage();
    global.manage = new ManagePage();
    global.reports = new ReportsPage();
    global.support = new SupportPage();
    global.cdr = new CdrPage();
    global.ssowizard = new SSOWizardPage();
    global.disyncwizard = new DirSyncWizardPage();
    global.download = new DownloadPage();
    global.activate = new ActivatePage();
    global.spaces = new SpacesPage();
    global.autoattendant = new AutoAttendantPage();
    global.partner = new PartnerHomePage();
    global.telephony = new TelephonyPage();
    global.wizard = new FirstTimeWizard();
    global.servicesetup = new ServiceSetup();
    global.roles = new RolesPage();
    global.meetings = new MeetingsPage();
    global.webExUserSettings = new WebExUserSettingsPage();
    global.webExSiteList = new WebExSiteListPage();
    global.webExSiteSettings = new WebExSiteSettigsPage();
    global.webExSiteReports = new WebExSiteReportsPage();
    global.webEx = new WebExPage();
    global.webExCommon = new WebExCommon();
    global.orgprofile = new OrgProfilePage();
    global.mediaservice = new MediaServicePage();
    global.enterpriseResource = new EnterpriseResourcePage();
    global.utilization = new UtilizationPage();
    global.meetings = new MeetingsPage();
    global.trialextinterest = new TrialExtInterestPage();
    global.inviteusers = new InviteUsers();
    global.huronFeatures = new HuronFeatures();
    global.huntGroup = new HuntGroup();
    global.enterEmailAddrPage = new EnterEmailAddrPage();
    global.createAccountPage = new CreateAccountPage();
    global.careLandingPage = new CareLandingPage();
    global.careFeatureLandingPage = new CareFeatureLandingPage();
    global.careChatTemplateSetupPage = new CareChatTemplateSetupPage();
    global.careVirtualAssistantTemplateSetupPage = new CareVirtualAssistantTemplateSetupPage();
    global.careSettingsPage = new CareSettingsPage();
    global.manageUsersPage = new ManageUsersPage();
    global.gssDashboard = new GSSDashboardPage();
    global.gssComponent = new GSSComponentPage();
    global.gssService = new GSSServicePage();
    global.gssIncident = new GSSIncidentPage();

    function initReporters(config) {
      var testFile = _.chain(config)
        .get('specs[0]', '')
        .split(config.configDir)
        .takeRight()
        .trimStart('/')
        .value();
      var jenkinsSubdir = process.env.BUILD_TAG || '';

      jasmine.getEnv().addReporter(
        new jasmineReporters.JUnitXmlReporter({
          savePath: 'test/e2e-protractor/reports/' + jenkinsSubdir + '/run-' + processEnvUtil.getE2eRunCounter(),
          consolidateAll: false,
        })
      );

      jasmine.getEnv().addReporter(
        new SpecReporter({
          displayStacktrace: true,
          displaySpecDuration: true,
        })
      );

      function FailRetry() {
        var hasFailure;
        this.specDone = function (result) {
          if (result.failedExpectations.length) {
            hasFailure = true;
          }
        };
        this.jasmineDone = function () {
          if (hasFailure) {
            fs.appendFileSync(E2E_FAIL_RETRY, testFile + NEWLINE);
          }
        };
      }
      jasmine.getEnv().addReporter(new FailRetry());

      function FailFast() {
        var specs = [];

        jasmine.getEnv().specFilter = function (spec) {
          specs.push(spec);
          return true;
        };

        function disableSpecs() {
          _.forEach(specs, function (spec) {
            spec.disable();
          });
        }

        this.specDone = function (spec) {
          if (spec.status === 'failed' && !args.nofailfast) {
            disableSpecs();
          }
        };
      }
      jasmine.getEnv().addReporter(new FailFast());
    }

    return browser.getProcessedConfig()
      .then(initReporters);
  },

  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: true,
    showColors: true,
    print: function () {},
    includeStackTrace: true,
    defaultTimeoutInterval: VERY_LONG_TIMEOUT,
  },

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: VERY_LONG_TIMEOUT,
};

function Logger() {
  var lastLogMessage;
  var lastLogMessageCount = 0;

  function log() {
    if (log.verbose || args.verbose) {
      var message = Array.prototype.slice.call(arguments);
      if (_.isEqual(lastLogMessage, message)) {
        lastLogMessageCount++;
      } else {
        if (lastLogMessage && lastLogMessageCount) {
          console.log('(Repeated ' + lastLogMessageCount + ' times...)');
        }
        lastLogMessage = message;
        lastLogMessageCount = 0;
        console.log.apply(console.log, arguments);
      }
    }
  }

  return log;
}

function mkProxyAgent() {
  if (process.env.SAUCE__ENABLE_WEB_PROXY === 'false') {
    return;
  }
  return new HttpsProxyAgent(process.env.http_proxy || 'http://proxy.esl.cisco.com:80');
}

function getLaunchUrl(args) {
  if (args.prod) {
    return 'https://' + hostnameConfig.PRODUCTION;
  }
  if (args.int) {
    return 'https://' + hostnameConfig.INTEGRATION;
  }
  return 'http://' + hostnameConfig.LOCAL + ':8000';
}
