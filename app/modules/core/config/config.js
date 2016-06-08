(function () {
  'use strict';

  angular
    .module('Core')
    .factory('Config', Config);

  function Config($location, Utils, $filter, Storage) {
    var TEST_ENV_CONFIG = 'TEST_ENV_CONFIG';

    var getCurrentHostname = function () {
      return $location.host() || '';
    };

    var config = {

      ciscoOrgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',

      ciscoMockOrgId: 'd30a6828-dc35-4753-bab4-f9b468828688',

      consumerOrgId: 'consumer',

      consumerMockOrgId: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5',

      feedbackUrl: 'https://conv-a.wbx2.com/conversation/api/v1/users/deskFeedbackUrl',

      scimSchemas: [
        'urn:scim:schemas:core:1.0',
        'urn:scim:schemas:extension:cisco:commonidentity:1.0'
      ],

      helpUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt',
      ssoUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt/content?filterID=contentstatus[published]~category[security]',
      rolesUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt/content?filterID=contentstatus[published]~category[getting-started]',
      supportUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt',
      partnerSupportUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt-partners',

      usersperpage: 100,
      orgsPerPage: 100,
      meetingsPerPage: 50,
      alarmsPerPage: 50,
      eventsPerPage: 50,

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
        collab: 'COLLAB', //to be deprecated; use message && meeting
        spark1: 'SPARK1', //to be deprecated; use message
        webex: 'WEBEX', // to be deprecated; use meetings
        squaredUC: 'SQUAREDUC', // to be deprecated; use call
        message: 'MESSAGE',
        meetings: 'MEETINGS', // to be deprecated; use meeting && webex
        meeting: 'MEETING',
        call: 'CALL',
        roomSystems: 'ROOMSYSTEMS',
        pstn: 'PSTN'
      },

      //WARNING: Deprecated, use offerTypes
      // These were how trials used to be mapped
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
        helpdesk: 'atlas-portal.partner.helpdesk',
        spark_synckms: 'spark.synckms',
        readonly_admin: 'id_readonly_admin'
      },

      roles: {
        full_admin: 'Full_Admin',
        all: 'All',
        billing: 'Billing',
        support: 'Support',
        application: 'Application',
        reports: 'Reports',
        sales: 'Sales_Admin',
        helpdesk: 'Help_Desk',
        spark_synckms: 'Spark_SyncKms',
        readonly_admin: 'Readonly_Admin',
        compliance_user: 'Compliance_User'
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
        COMMUNICATION: 'COMMUNICATION',
        STORAGE: 'STORAGE',
        SHARED_DEVICES: 'SHARED_DEVICES',
        CMR: 'CMR'
      },

      defaultEntitlements: ['webex-squared', 'squared-call-initiation'],

      batchSize: 10,

      isDev: function () {
        var currentHostname = getCurrentHostname();
        return !config.forceProdForE2E() && (currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost' || currentHostname === 'server');
      },

      isIntegration: function () {
        return !config.forceProdForE2E() && getCurrentHostname() === 'int-admin.ciscospark.com';
      },

      isProd: function () {
        return config.forceProdForE2E() || getCurrentHostname() === 'admin.ciscospark.com';
      },

      isCfe: function () {
        return !config.forceProdForE2E() && getCurrentHostname() === 'cfe-admin.ciscospark.com';
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

      getDefaultEntitlements: function () {
        return this.defaultEntitlements;
      },

    };

    config.setTestEnvConfig = function (testEnv) {
      if (testEnv) {
        Storage.put(TEST_ENV_CONFIG, testEnv); // Store in localStorage so new windows pick up the value, will be cleared on logout
      }
    };

    config.isE2E = function () {
      return _.includes(Storage.get(TEST_ENV_CONFIG), 'e2e');
    };

    config.forceProdForE2E = function () {
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
        'activateProduct',
        'settings',
        'userRedirect'
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
        'activateProduct',
        'settings'
      ],
      Support: ['support', 'reports', 'billing', 'cdrsupport', 'cdr-overview', 'cdrladderdiagram'],
      WX2_User: ['overview', 'reports', 'support', 'activateProduct'],
      WX2_Support: ['overview', 'reports', 'support'],
      WX2_SquaredInviter: [],
      PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'customer-overview', 'partnerreports', 'trialAdd', 'trialEdit', 'profile', 'pstnSetup', 'video', 'settings'],
      PARTNER_READ_ONLY_ADMIN: ['partneroverview', 'partnercustomers', 'customer-overview', 'partnerreports', 'trialEdit', 'profile', 'pstnSetup', 'settings'],
      PARTNER_SALES_ADMIN: ['overview', 'partneroverview', 'customer-overview', 'partnercustomers', 'partnerreports', 'trialAdd', 'trialEdit', 'pstnSetup', 'video', 'settings'],
      CUSTOMER_PARTNER: ['overview', 'partnercustomers', 'customer-overview'],
      //TODO User role is used by Online Ordering UI. The dr* states will be removed once the Online UI is separated from Atlas.
      User: ['drLoginReturn', 'drOnboard', 'drConfirmAdminOrg', 'drOnboardQuestion', 'drOnboardEnterAdminEmail', 'drOrgName', 'drAdminChoices'],
      Site_Admin: [
        'site-list',
        'site-csv-import',
        'site-csv',
        'site-csv-results',
        'site-settings',
        'site-setting',
        'webex-reports',
        'webex-reports-iframe'
      ],
      Application: ['organizations', 'organization-overview'],
      Help_Desk: ['helpdesk', 'helpdesk.search', 'helpdesk.user', 'helpdesk.org', 'helpdesklaunch'],
      Compliance_User: ['ediscovery', 'ediscovery.search', 'ediscovery.reports']
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
        'devices-redux',
        'services-overview'
      ],
      'squared-fusion-mgmt': [
        'cluster-details',
        'management-service',
        'services-overview',
        'my-company'
      ],
      'spark-room-system': [
        'devices',
        'device-overview',
        'devices-redux'
      ],
      'squared-fusion-uc': [
        'cluster-list',
        'call-service',
        'expressway-settings',
        'mediafusion-settings'
      ],
      'squared-fusion-cal': [
        'calendar-service',
        'services-overview',
        'cluster-list',
        'expressway-settings',
        'mediafusion-settings'
      ],
      'squared-team-member': [
        'organization'
      ],
      'squared-fusion-media': [
        //'mediafusionconnector',
        'metrics',
        'reports-metrics',
        'media-service',
        'connector-details'
      ],
      'webex-messenger': [
        'messenger'
      ],
      'contact-center-context': [
        //TODO: Remove these states when sunlight trial stories are implemented and
        // add back them to 'ccc_config' serviceState
        'care'
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
        'cluster-list',
        'expressway-settings',
        'mediafusion-settings',
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
