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

      feedbackNavConfig: {
        mailto: 'sq-admin-support@cisco.com',
        subject: 'Squared%20Admin%20Feedback'
      },

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

      chartColors: {
        blue: '#3ca8e8',
        red: '#F46315',
        yellow: '#EBC31C',
        green: '#50D71D',
        brandSuccessDark: '#6ab140',
        brandSuccess: "#7cc153",
        brandSuccessLight: '#99cf78',
        brandWhite: '#fff',
        grayDarkest: '#444',
        grayDarker: '#666',
        grayDark: '#999',
        gray: '#aaa',
        grayLight: '#ccc',
        grayLighter: '#ddd',
        brandInfo: '#00c1aa',
        brandDanger: '#f05d3b',
        brandWarning: '#f7c100',
        dummyGray: '#ECECEC',
        primaryColorLight: '#66C5E8',
        primaryColorBase: '#049FD9',
        primaryColorDarker: '#0387B8',
        dummyGrayLight: '#F3F3F3',
        dummyGrayLighter: '#FAFAFA',
        colorAttentionBase: '#F5A623',
        colorPeopleBase: '#14A792'
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

      getScimUrl: function (orgId) {
        var params = [orgId];
        var scimUrl = {
          'dev': Utils.sprintf(serviceUrlMapping.scimUrl.dev, params),
          'cfe': Utils.sprintf(serviceUrlMapping.scimUrl.cfe, params),
          'integration': Utils.sprintf(serviceUrlMapping.scimUrl.integration, params),
          'prod': Utils.sprintf(serviceUrlMapping.scimUrl.prod, params)
        };

        return scimUrl[this.getEnv()];
      },

      getUserReportsUrl: function (orgId) {
        var params = [orgId];
        var userReportsUrl = {
          'dev': Utils.sprintf(serviceUrlMapping.userReportsUrl.dev, params),
          'cfe': Utils.sprintf(serviceUrlMapping.userReportsUrl.cfe, params),
          'integration': Utils.sprintf(serviceUrlMapping.userReportsUrl.integration, params),
          'prod': Utils.sprintf(serviceUrlMapping.userReportsUrl.prod, params)
        };

        return userReportsUrl[this.getEnv()];
      },

      getScomUrl: function () {
        var scomUrl = {
          'dev': serviceUrlMapping.scomUrl.dev,
          'cfe': serviceUrlMapping.scomUrl.cfe,
          'integration': serviceUrlMapping.scomUrl.integration,
          'prod': serviceUrlMapping.scomUrl.prod
        };

        return scomUrl[this.getEnv()];
      },

      getDomainManagementUrl: function (orgId) {
        var params = [orgId];
        var domainManagementUrl = {
          'dev': Utils.sprintf(serviceUrlMapping.domainManagementUrl.dev, params),
          'cfe': Utils.sprintf(serviceUrlMapping.domainManagementUrl.cfe, params),
          'integration': Utils.sprintf(serviceUrlMapping.domainManagementUrl.integration, params),
          'prod': Utils.sprintf(serviceUrlMapping.domainManagementUrl.prod, params)
        };

        return domainManagementUrl[this.getEnv()];
      },

      getAdminServiceUrl: function () {
        var adminServiceUrl = {
          'dev': serviceUrlMapping.adminServiceUrl.integration,
          'cfe': serviceUrlMapping.adminServiceUrl.cfe,
          'integration': serviceUrlMapping.adminServiceUrl.integration,
          'prod': serviceUrlMapping.adminServiceUrl.prod
        };

        return adminServiceUrl[this.getEnv()];
      },

      getSparkDomainManagementUrl: function () {
        var sparkDomainManagementUrl = {
          'dev': serviceUrlMapping.sparkDomainManagementUrl.dev,
          'cfe': serviceUrlMapping.sparkDomainManagementUrl.cfe,
          'integration': serviceUrlMapping.sparkDomainManagementUrl.integration,
          'prod': serviceUrlMapping.sparkDomainManagementUrl.prod
        };

        return sparkDomainManagementUrl[this.getEnv()];
      },

      getSparkDomainCheckUrl: function () {
        var sparkDomainCheckUrl = {
          'dev': serviceUrlMapping.sparkDomainCheckUrl.dev,
          'cfe': serviceUrlMapping.sparkDomainCheckUrl.cfe,
          'integration': serviceUrlMapping.sparkDomainCheckUrl.integration,
          'prod': serviceUrlMapping.sparkDomainCheckUrl.prod
        };

        return sparkDomainCheckUrl[this.getEnv()];
      },

      getProdAdminServiceUrl: function () {
        return serviceUrlMapping.adminServiceUrl.prod;
      },

      getCsdmServiceUrl: function () {
        var csdmServiceUrl = {
          'dev': serviceUrlMapping.csdmServiceUrl.integration,
          'cfe': serviceUrlMapping.csdmServiceUrl.cfe,
          'integration': serviceUrlMapping.csdmServiceUrl.integration,
          'prod': serviceUrlMapping.csdmServiceUrl.prod
        };

        return csdmServiceUrl[this.getEnv()];
      },

      getMessengerServiceUrl: function () {
        var msgrServiceUrl = {
          'dev': serviceUrlMapping.messengerServiceUrl.integration,
          'cfe': serviceUrlMapping.messengerServiceUrl.cfe,
          'integration': serviceUrlMapping.messengerServiceUrl.integration,
          'prod': serviceUrlMapping.messengerServiceUrl.prod
        };

        return msgrServiceUrl[this.getEnv()];
      },

      getLocusServiceUrl: function () {
        var locusServiceUrl = {
          'dev': serviceUrlMapping.locusServiceUrl.integration,
          'cfe': serviceUrlMapping.locusServiceUrl.integration,
          'integration': serviceUrlMapping.locusServiceUrl.integration,
          'prod': serviceUrlMapping.locusServiceUrl.integration
        };

        return locusServiceUrl[this.getEnv()];
      },

      getFeatureToggleUrl: function () {
        var locusServiceUrl = {
          'dev': serviceUrlMapping.locusServiceUrl.prod,
          'cfe': serviceUrlMapping.locusServiceUrl.cfe,
          'integration': serviceUrlMapping.locusServiceUrl.prod,
          'prod': serviceUrlMapping.locusServiceUrl.prod
        };

        return locusServiceUrl[this.getEnv()];
      },

      getEnrollmentServiceUrl: function () {
        var enrollmentServiceUrl = {
          'dev': serviceUrlMapping.enrollmentServiceUrl.integration,
          'cfe': serviceUrlMapping.enrollmentServiceUrl.cfe,
          'integration': serviceUrlMapping.enrollmentServiceUrl.integration,
          'prod': serviceUrlMapping.enrollmentServiceUrl.prod
        };

        return enrollmentServiceUrl[this.getEnv()];
      },

      getMeetingServiceUrl: function () {
        var meetingServiceUrl = {
          'dev': serviceUrlMapping.meetingServiceUrl.dev,
          'cfe': serviceUrlMapping.meetingServiceUrl.cfe,
          'integration': serviceUrlMapping.meetingServiceUrl.integration,
          'prod': serviceUrlMapping.meetingServiceUrl.prod
        };

        return meetingServiceUrl[this.getEnv()];
      },

      getMeetingInfoServiceUrl: function () {
        var meetingInfoServiceUrl = {
          'dev': serviceUrlMapping.meetingInfoServiceUrl.dev,
          'cfe': serviceUrlMapping.meetingInfoServiceUrl.cfe,
          'integration': serviceUrlMapping.meetingInfoServiceUrl.integration,
          'prod': serviceUrlMapping.meetingInfoServiceUrl.prod
        };

        return meetingInfoServiceUrl[this.getEnv()];
      },

      getMetricsServiceUrl: function () {
        var metricsServiceUrl = {
          'dev': serviceUrlMapping.metricsServiceUrl.dev,
          'cfe': serviceUrlMapping.metricsServiceUrl.cfe,
          'integration': serviceUrlMapping.metricsServiceUrl.integration,
          'prod': serviceUrlMapping.metricsServiceUrl.prod
        };

        return metricsServiceUrl[this.getEnv()];
      },

      getThresholdServiceUrl: function () {
        var thresholdServiceUrl = {
          'dev': serviceUrlMapping.thresholdServiceUrl.dev,
          'cfe': serviceUrlMapping.thresholdServiceUrl.cfe,
          'integration': serviceUrlMapping.thresholdServiceUrl.integration,
          'prod': serviceUrlMapping.thresholdServiceUrl.prod
        };

        return thresholdServiceUrl[this.getEnv()];
      },

      getAlarmServiceUrl: function () {
        var alarmServiceUrl = {
          'dev': serviceUrlMapping.alarmServiceUrl.dev,
          'cfe': serviceUrlMapping.alarmServiceUrl.cfe,
          'integration': serviceUrlMapping.alarmServiceUrl.integration,
          'prod': serviceUrlMapping.alarmServiceUrl.prod
        };

        return alarmServiceUrl[this.getEnv()];
      },

      getEventServiceUrl: function () {
        var eventServiceUrl = {
          'dev': serviceUrlMapping.alarmServiceUrl.dev,
          'cfe': serviceUrlMapping.alarmServiceUrl.cfe,
          'integration': serviceUrlMapping.alarmServiceUrl.integration,
          'prod': serviceUrlMapping.alarmServiceUrl.prod
        };

        return eventServiceUrl[this.getEnv()];
      },

      getFaultServiceUrl: function () {
        var faultServiceUrl = {
          'dev': serviceUrlMapping.thresholdServiceUrl.dev,
          'cfe': serviceUrlMapping.thresholdServiceUrl.cfe,
          'integration': serviceUrlMapping.thresholdServiceUrl.integration,
          'prod': serviceUrlMapping.thresholdServiceUrl.prod
        };

        return faultServiceUrl[this.getEnv()];
      },

      getLogoutUrl: function () {
        var acu = this.getAdminPortalUrl();
        return this.logoutUrl + encodeURIComponent(acu);
      },

      getAdminPortalUrl: function () {
        return serviceUrlMapping.adminClientUrl[this.getEnv()];
      },

      getSSOSetupUrl: function () {
        return this.ssoSetupUrl;
      },

      getSSOTestUrl: function () {
        return this.ssoTestUrl;
      },

      getHealthCheckUrlServiceUrl: function () {
        var healthCheckServiceUrl = {
          'dev': serviceUrlMapping.healthCheckUrl.dev,
          'cfe': serviceUrlMapping.healthCheckUrl.cfe,
          'integration': serviceUrlMapping.healthCheckUrl.integration,
          'prod': serviceUrlMapping.healthCheckUrl.prod
        };

        return healthCheckServiceUrl[this.getEnv()];
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

      getHerculesUrl: function () {
        var herculesUrl = {
          'dev': serviceUrlMapping.herculesUrl.dev,
          'cfe': serviceUrlMapping.herculesUrl.cfe,
          'integration': serviceUrlMapping.herculesUrl.integration,
          'prod': serviceUrlMapping.herculesUrl.prod
        };

        return herculesUrl[this.getEnv()];
      },

      getHerculesUrlV2: function () {
        var herculesUrl = {
          'dev': serviceUrlMapping.herculesUrlV2.dev,
          'cfe': serviceUrlMapping.herculesUrlV2.cfe,
          'integration': serviceUrlMapping.herculesUrlV2.integration,
          'prod': serviceUrlMapping.herculesUrlV2.prod
        };

        return herculesUrl[this.getEnv()];
      },

      getUssUrl: function () {
        var ussUrl = {
          'dev': serviceUrlMapping.ussUrl.dev,
          'cfe': serviceUrlMapping.ussUrl.cfe,
          'integration': serviceUrlMapping.ussUrl.integration,
          'prod': serviceUrlMapping.ussUrl.prod
        };

        return ussUrl[this.getEnv()];
      },

      getCalliopeUrl: function () {
        var calliopeUrl = {
          'dev': serviceUrlMapping.calliopeUrl.dev,
          'cfe': serviceUrlMapping.calliopeUrl.cfe,
          'integration': serviceUrlMapping.calliopeUrl.integration,
          'prod': serviceUrlMapping.calliopeUrl.prod
        };

        return calliopeUrl[this.getEnv()];
      },

      getCertsUrl: function () {
        var certsUrl = {
          'dev': serviceUrlMapping.certsUrl.dev,
          'cfe': serviceUrlMapping.certsUrl.cfe,
          'integration': serviceUrlMapping.certsUrl.integration,
          'prod': serviceUrlMapping.certsUrl.prod
        };

        return certsUrl[this.getEnv()];
      },

      getWdmUrl: function () {
        var wdmUrl = {
          'dev': serviceUrlMapping.wdmUrl.dev,
          'cfe': serviceUrlMapping.wdmUrl.cfe,
          'integration': serviceUrlMapping.wdmUrl.dev,
          'prod': serviceUrlMapping.wdmUrl.dev
        };

        return wdmUrl[this.getEnv()];
      },

      getDefaultEntitlements: function () {
        return this.defaultEntitlements;
      },

      getUtilizationServiceUrl: function () {
        var utilizationServiceUrl = {
          'dev': serviceUrlMapping.utilizationServiceUrl.dev,
          'cfe': serviceUrlMapping.utilizationServiceUrl.cfe,
          'integration': serviceUrlMapping.utilizationServiceUrl.integration,
          'prod': serviceUrlMapping.utilizationServiceUrl.prod
        };

        return utilizationServiceUrl[this.getEnv()];
      },

      getWebexAdvancedHomeUrl: function (siteURL) {
        var params = [siteURL];
        return Utils.sprintf(this.webexUrl.siteAdminHomeUrl, params);
      },

      getWebexAdvancedEditUrl: function (siteURL) {
        var params = [siteURL];
        return Utils.sprintf(this.webexUrl.siteAdminDeepUrl, params);
      },

      getSunlightConfigServiceUrl: function () {
        var sunlightConfigServiceUrl = {
          'dev': serviceUrlMapping.sunlightConfigServiceUrl.dev,
          'cfe': serviceUrlMapping.sunlightConfigServiceUrl.cfe,
          'integration': serviceUrlMapping.sunlightConfigServiceUrl.integration,
          'prod': serviceUrlMapping.sunlightConfigServiceUrl.prod
        };

        return sunlightConfigServiceUrl[this.getEnv()];
      },

      getCdrUrl: function () {
        var cdrConfigServiceUrl = {
          'dev': serviceUrlMapping.cdrUrl.dev,
          'cfe': serviceUrlMapping.cdrUrl.cfe,
          'integration': serviceUrlMapping.cdrUrl.integration,
          'prod': serviceUrlMapping.cdrUrl.prod
        };

        return cdrConfigServiceUrl[this.getEnv()];
      }
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
      Support: ['support', 'reports', 'billing', 'cdrsupport', 'cdr-overview', 'cdrladderdiagram'],
      WX2_User: ['overview', 'reports', 'support', 'activateProduct'],
      WX2_Support: ['overview', 'reports', 'support'],
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

    return config;
  }

}());
