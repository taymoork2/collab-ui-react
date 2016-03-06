(function () {
  'use strict';

  angular
    .module('Core')
    .factory('Config', Config);

  function Config($location, Utils, $filter, Storage, serviceUrlMapping) {
    var TEST_ENV_CONFIG = 'TEST_ENV_CONFIG';

    var getCurrentHostname = function () {
      return $location.host() || '';
    };

    var config = {

      ciscoOrgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',

      ciscoMockOrgId: 'd30a6828-dc35-4753-bab4-f9b468828688',

      consumerOrgId: 'consumer',

      logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

      ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

      ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

      statusPageUrl: 'http://status.ciscospark.com/',

      logMetricUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',

      callflowServiceUrl: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',

      feedbackUrl: 'https://conv-a.wbx2.com/conversation/api/v1/users/deskFeedbackUrl',

      appinfo: {
        webClientURL: 'https://web.ciscospark.com/',
        iPhoneURL: 'http://cs.co/sqios',
        androidURL: 'http://cs.co/sqandroid',
        androidAppIntent: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
        appURL: 'squared://'
      },

      webexUrl: {
        siteAdminHomeUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
        siteAdminDeepUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage'
      },

      scimSchemas: [
        'urn:scim:schemas:core:1.0',
        'urn:scim:schemas:extension:cisco:commonidentity:1.0'
      ],

      helpUrl: 'https://support.ciscospark.com',
      ssoUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt/content?filterID=contentstatus[published]~category[security]',
      rolesUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt/content?filterID=contentstatus[published]~category[getting-started]',
      supportUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt',

      usersperpage: 100,
      orgsPerPage: 100,
      meetingsPerPage: 50,
      alarmsPerPage: 50,
      eventsPerPage: 50,

      logConfig: {
        linesToAttach: 100,
        keepOnNavigate: false
      },

      tokenTimers: {
        timeoutTimer: 3000000, // 50 mins
        refreshTimer: 39600000, // 11 hours
        refreshDelay: 900000 // 15 mins
      },

      entitlements: {
        huron: 'ciscouc',
        squared: 'webex-squared',
        fusion_uc: 'squared-fusion-uc',
        fusion_cal: 'squared-fusion-cal',
        mediafusion: 'squared-fusion-media',
        fusion_mgmt: 'squared-fusion-mgmt',
        room_system: 'spark-room-system',
        fusion_ec: 'squared-fusion-ec',
        messenger: 'webex-messenger'
      },

      offerTypes: {
        collab: 'COLLAB',
        spark1: 'SPARK1', //to be depricated; use message
        webex: 'WEBEX', // to be depricated; use meetings
        squaredUC: 'SQUAREDUC', // to be depricated; use call
        message: 'MESSAGE',
        meetings: 'MEETINGS',
        call: 'CALL',
        roomSystems: 'ROOMSYSTEMS',
        pstn: 'PSTN'
      },

      //WARNING: Deprecated, use offerTypes
      trials: {
        message: 'COLLAB',
        meeting: 'WEBEX',
        call: 'SQUAREDUC',
        roomSystems: 'ROOMSYSTEMS'
      },

      //TODO: Revisit whether or not this is still needed or need to be modified now that there is offerTypes.
      organizations: {
        collab: 'COLLAB',
        squaredUC: 'SQUAREDUC'
      },

      backend_roles: { // as stored in the ci
        full_admin: 'id_full_admin',
        all: 'atlas-portal.all',
        billing: 'atlas-portal.billing',
        support: 'atlas-portal.support',
        application: 'atlas-portal.application',
        reports: 'atlas-portal.reports',
        sales: 'atlas-portal.partner.salesadmin',
        helpdesk: 'atlas-portal.partner.helpdesk'
      },

      roles: {
        full_admin: 'Full_Admin',
        all: 'All',
        billing: 'Billing',
        support: 'Support',
        application: 'Application',
        reports: 'Reports',
        sales: 'Sales_Admin',
        helpdesk: 'Help_Desk'
      },

      roleState: {
        active: 'ACTIVE',
        inactive: 'INACTIVE'
      },

      confMap: {
        MS: 'onboardModal.paidMsg',
        CF: 'onboardModal.paidConf',
        EE: 'onboardModal.enterpriseEdition',
        MC: 'onboardModal.meetingCenter',
        SC: 'onboardModal.supportCenter',
        TC: 'onboardModal.trainingCenter',
        EC: 'onboardModal.eventCenter',
        CO: 'onboardModal.communication'
      },

      offerCodes: {
        MS: 'MS', // Messaging
        CF: 'CF', // Conferencing
        EE: 'EE', // Enterprise Edition (WebEx)
        MC: 'MC', // Meeting Center (WebEx)
        SC: 'SC', // Support Center (WebEx)
        TC: 'TC', // Training Center (WebEx)
        EC: 'EC', // Event Center (WebEx)
        CO: 'CO', // Communication
        SD: 'SD', // Spark Room System
        CMR: 'CMR', // Collaboration Meeting Room (WebEx)
      },

      licenseTypes: {
        MESSAGING: 'MESSAGING',
        CONFERENCING: 'CONFERENCING',
        COMMUNICATIONS: 'COMMUNICATIONS',
        STORAGE: 'STORAGE',
        SHARED_DEVICES: 'SHARED_DEVICES',
        CMR: 'CMR'
      },

      defaultEntitlements: ['webex-squared', 'squared-call-initiation'],

      batchSize: 10,

      isDev: function () {
        var currentHostname = getCurrentHostname();
        return !config.isE2E() && (currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost' || currentHostname === 'server');
      },

      isIntegration: function () {
        return !config.isE2E() && getCurrentHostname() === 'int-admin.ciscospark.com';
      },

      isProd: function () {
        return getCurrentHostname() === 'admin.ciscospark.com';
      },

      isCfe: function () {
        return !config.isE2E() && getCurrentHostname() === 'cfe-admin.ciscospark.com';
      },

      getEnv: function () {
        if (this.isDev()) {
          return 'dev';
        } else if (this.isCfe()) {
          return 'cfe';
        } else if (this.isIntegration()) {
          return 'integration';
        } else {
          return 'prod';
        }
      },

      getProdAdminServiceUrl: function () {
        return serviceUrlMapping.adminServiceUrl.prod;
      },

      getLogoutUrl: function () {
        var acu = this.getAdminPortalUrl();
        return this.logoutUrl + encodeURIComponent(acu);
      },

      getSSOSetupUrl: function () {
        return this.ssoSetupUrl;
      },

      getSSOTestUrl: function () {
        return this.ssoTestUrl;
      },

      getLogMetricsUrl: function () {
        return this.logMetricUrl;
      },

      getCallflowServiceUrl: function () {
        return this.callflowServiceUrl;
      },

      getStatusPageUrl: function () {
        return this.statusPageUrl;
      },

      getSquaredAppUrl: function () {
        return this.appinfo.appURL;
      },

      getItunesStoreUrl: function () {
        return this.appinfo.iPhoneURL;
      },

      getAndroidStoreUrl: function () {
        return this.appinfo.androidURL;
      },

      getAndroidAppIntent: function () {
        return this.appinfo.androidAppIntent;
      },

      getWebClientUrl: function () {
        return this.appinfo.webClientURL;
      },

      getDefaultEntitlements: function () {
        return this.defaultEntitlements;
      },

      getWebexAdvancedHomeUrl: function (siteURL) {
        var params = [siteURL];
        return Utils.sprintf(this.webexUrl.siteAdminHomeUrl, params);
      },

      getWebexAdvancedEditUrl: function (siteURL) {
        var params = [siteURL];
        return Utils.sprintf(this.webexUrl.siteAdminDeepUrl, params);
      },
    };

    config.setTestEnvConfig = function (testEnv) {
      if (testEnv) {
        Storage.put(TEST_ENV_CONFIG, testEnv); // Store in localStorage so new windows pick up the value, will be cleared on logout
      }
    };

    config.isE2E = function () {
      return Storage.get(TEST_ENV_CONFIG) === 'e2e-prod';
    };

    config.roleStates = {
      // Customer Admin
      Full_Admin: [
        'overview',
        'domainmanagement',
        'dr-login-forward',
        'users',
        'user-overview',
        'userprofile',
        'reports',
        'devReports',
        'setupwizardmodal',
        'firsttimewizard',
        'groups',
        'profile',
        'customerprofile',
        'support',
        'editService',
        'trialExtInterest',
        'cdrsupport',
        'cdr-overview',
        'cdrladderdiagram',
        'activateProduct'
      ],
      Readonly_Admin: [
        'overview',
        'users',
        'user-overview',
        'userprofile',
        'reports',
        'setupwizardmodal',
        'firsttimewizard',
        'groups',
        'profile',
        'customerprofile',
        'support',
        'editService',
        'trialExtInterest',
        'activateProduct'
      ],
      Support: ['support', 'reports', 'billing', 'devReports', 'cdrsupport', 'cdr-overview', 'cdrladderdiagram'],
      WX2_User: ['overview', 'reports', 'support', 'devReports', 'activateProduct'],
      WX2_Support: ['overview', 'reports', 'support', 'devReports'],
      WX2_SquaredInviter: [],
      PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'customer-overview', 'partnerreports', 'trialAdd', 'trialEdit', 'profile', 'pstnSetup', 'video'],
      PARTNER_READ_ONLY_ADMIN: ['partneroverview', 'partnercustomers', 'customer-overview', 'partnerreports', 'trialEdit', 'profile', 'pstnSetup'],
      PARTNER_SALES_ADMIN: ['overview', 'partneroverview', 'customer-overview', 'partnercustomers', 'partnerreports', 'trialAdd', 'trialEdit', 'pstnSetup', 'video'],
      CUSTOMER_PARTNER: ['overview', 'partnercustomers', 'customer-overview'],
      User: [],
      Site_Admin: [
        'site-list',
        'site-settings',
        'site-setting',
        'webex-reports',
        'webex-reports-iframe',
        'example'
      ],
      Application: ['organizations', 'organization-overview'],
      Help_Desk: ['helpdesk', 'helpdesk.search', 'helpdesk.user', 'helpdesk.org', 'helpdesklaunch']
    };

    config.serviceStates = {
      'ciscouc': [
        'callrouting',
        'mediaonhold',
        'generateauthcode',
        'autoattendant',
        'callpark',
        'callpickup',
        'intercomgroups',
        'paginggroups',
        'huntgroups',
        'didadd',
        'hurondetails',
        'huronlines',
        'huronsettings',
        'huronfeatures',
        'huronnewfeature',
        'huronHuntGroup',
        'huntgroupedit',
        'devices',
        'device-overview',
        'devices-redux'
      ],
      'squared-fusion-mgmt': [
        'cluster-details',
        'management-service'
      ],
      'spark-room-system': [
        'devices',
        'device-overview',
        'devices-redux'
      ],
      'squared-fusion-uc': [
        'call-service'
      ],
      'squared-fusion-cal': [
        'calendar-service'
      ],
      'squared-team-member': [
        'organization'
      ],
      'squared-fusion-media': [
        'meetings',
        'vts',
        'utilization',
        'metrics',
        'threshold',
        'fault',
        'alarms',
        'events',
        //'mediafusionconnector',
        'media-service',
        'connector-details'
      ],
      'webex-messenger': [
        'messenger'
      ]
    };

    // These states are not allowed in specific views
    // (i.e. devices are not allowed in partner)
    config.restrictedStates = {
      'customer': [
        'partneroverview',
        'partnerreports'
      ],
      'partner': [
        'overview',
        'reports',
        'devReports',
        'devices',
        'fusion',
        //'mediafusionconnector',
        'media-service',
        'hurondetails',
        'huronsettings',
        'calendar-service',
        'call-service',
        'management-service'
      ]
    };

    // These states do not require a role/service check
    config.publicStates = ['unauthorized', '404', 'csadmin'];

    config.ciscoOnly = ['billing'];

    var urlsToExpose = [
      'adminPortalUrl',
      'scimUrl',
      'userReportsUrl',
      'scomUrl',
      'domainManagementUrl',
      'adminServiceUrl',
      'sparkDomainManagementUrl',
      'sparkDomainCheckUrl',
      'meetingServiceUrl',
      'meetingInfoServiceUrl',
      'metricsServiceUrl',
      'thresholdServiceUrl',
      'alarmServiceUrl',
      'eventServiceUrl',
      'faultServiceUrl',
      'healthCheckServiceUrl',
      'herculesUrl',
      'herculesUrlV2',
      'ussUrl',
      'calliopeUrl',
      'certsUrl',
      'utilizationServiceUrl',
      'sunlightConfigServiceUrl',
      'cdrUrl',
      'csdmServiceUrl',
      'messengerServiceUrl',
      'locusServiceUrl',
      'featureToggleUrl',
      'enrollmentServiceUrl',
      'wdmUrl'
    ];

    function upperFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    _.each(urlsToExpose, function (url) {
      config['get' + upperFirst(url)] = function () {
        var env = config.getEnv();
        var args = _.toArray(arguments);
        return Utils.sprintf(serviceUrlMapping[url][env], args);
      };
    });

    return config;
  }

}());
