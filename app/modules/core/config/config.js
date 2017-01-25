(function () {
  'use strict';

  module.exports = angular
    .module('core.config', [
      require('modules/core/scripts/services/storage')
    ])
    .factory('Config', Config)
    .name;

  function Config($location, Storage) {
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
      trialGracePeriod: -30, // equal to the number of days left in a trial when it passes grace period

      tokenTimers: {
        timeoutTimer: 3000000, // 50 mins
        refreshTimer: 6600000, // 1 hour 50 mins (Access token expires in 120 mins)
        refreshDelay: 540000 // 9 mins
      },

      siteDomainUrl: {
        webexUrl: '.webex.com'
      },

      entitlements: {
        huron: 'ciscouc',
        squared: 'webex-squared',
        fusion_uc: 'squared-fusion-uc',
        fusion_cal: 'squared-fusion-cal',
        fusion_gcal: 'squared-fusion-gcal',
        mediafusion: 'squared-fusion-media',
        hds: 'spark-hybrid-datasecurity',
        fusion_mgmt: 'squared-fusion-mgmt',
        room_system: 'spark-room-system',
        fusion_ec: 'squared-fusion-ec',
        messenger: 'webex-messenger',
        care: 'cloud-contact-center',
        context: 'contact-center-context',
        fusion_google_cal: 'squared-fusion-gcal'
      },

      licenseModel: {
        cloudSharedMeeting: 'cloud shared meeting',
        hosts: 'hosts'
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
        sparkBoard: 'SPARKBOARDS',
        pstn: 'PSTN',
        care: 'CARE',
        context: 'CONTEXT'
      },

      // These can be used to access object properties for trials
      licenseObjectNames: [
        'messaging',
        'communications',
        'care',
        'roomSystems',
        'conferencing',
        'webexCMR',
        'webexEEConferencing',
        'webexEventCenter',
        'webexMeetingCenter',
        'webexTrainingCenter',
        'webexSupportCenter'
      ],

      webexTypes: [
        'webexCMR',
        'webexEEConferencing',
        'webexEventCenter',
        'webexMeetingCenter',
        'webexTrainingCenter',
        'webexSupportCenter'
      ],

      freeLicenses: [
        'messaging',
        'communications',
        'conferencing'
      ],

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
        orderadmin: 'atlas-portal.partner.orderadmin',
        spark_synckms: 'spark.synckms',
        readonly_admin: 'id_readonly_admin',
        tech_support: 'atlas-portal.cisco.techsupport'
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
        orderadmin: 'Order_Admin',
        spark_synckms: 'Spark_SyncKms',
        readonly_admin: 'Readonly_Admin',
        compliance_user: 'Compliance_User',
        tech_support: 'Tech_Support'
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
        SB: 'SB', // Spark Board
        CMR: 'CMR', // Collaboration Meeting Room (WebEx)
        CDC: 'CDC' // Care Digital Channel
      },

      licenseStatus: {
        PENDING: 'PENDING',
        ACTIVE: 'ACTIVE',
        CANCELLED: 'CANCELLED',
        SUSPENDED: 'SUSPENDED'
      },

      licenseTypes: {
        MESSAGING: 'MESSAGING',
        CONFERENCING: 'CONFERENCING',
        COMMUNICATION: 'COMMUNICATION',
        STORAGE: 'STORAGE',
        SHARED_DEVICES: 'SHARED_DEVICES',
        CMR: 'CMR',
        CARE: 'CARE'
      },

      messageErrors: {
        userExistsError: '400081',
        userPatchError: '400084',
        claimedDomainError: '400091',
        userExistsInDiffOrgError: '400090',
        notSetupForManUserAddError: '400110',
        userExistsDomainClaimError: '400108',
        unknownCreateUserError: '400096',
        unableToMigrateError: '400109',
        insufficientEntitlementsError: '400111',
        hybridServicesError: '400087',
        hybridServicesComboError: '400094',
      },

      timeFormat: {
        HOUR_12: '12-hour',
        HOUR_24: '24-hour'
      },

      dateFormat: {
        MDY_H: 'M-D-Y',
        DMY_H: 'D-M-Y',
        YMD_H: 'Y-M-D',
        MDY_P: 'M.D.Y',
        DMY_P: 'D.M.Y',
        YMD_P: 'Y.M.D',
        MDY_S: 'M/D/Y',
        DMY_S: 'D/M/Y',
        YMD_S: 'Y/M/D'
      },

      webexSiteStatus: {
        RECEIVED: 'RECEIVED',
        PENDING_PARM: 'PENDING_PARM',
        PROV_READY: 'PROV_READY',
        PROVISIONING: 'PROVISIONING',
        PROVISIONED: 'PROVISIONED',
        REJECTED: 'REJECTED',
        ERROR: 'ERROR',
        PARTIAL: 'PARTIAL',
        ABORTED: 'ABORTED',
        TIMEOUT: 'TIMEOUT',
        NA: 'NA'
      },

      defaultEntitlements: ['webex-squared', 'squared-call-initiation'],

      batchSize: 10,

      isDevHostName: function (hostName) {
        var whitelistDevHosts = [
          '0.0.0.0',
          '127.0.0.1',
          'localhost',
          'server',
          'dev-admin.ciscospark.com'
        ];
        return _.includes(whitelistDevHosts, hostName);
      },

      canUseAbsUrlForDevLogin: function (absUrl) {
        var whitelistAbsUrls = [
          'http://127.0.0.1:8000',
          'http://dev-admin.ciscospark.com:8000'
        ];
        return _.includes(whitelistAbsUrls, absUrl);
      },

      getAbsUrlAtRootContext: function () {
        var portSuffix = ($location.port()) ? ':' + $location.port() : '';
        return $location.protocol() + '://' + $location.host() + portSuffix;
      },

      isDev: function () {
        var currentHostname = getCurrentHostname();
        return !config.forceProdForE2E() && config.isDevHostName(currentHostname);
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
        'activateProduct',
        'cdr-overview',
        'cdrladderdiagram',
        'cdrsupport',
        'customerprofile',
        'domainmanagement',
        'dr-login-forward',
        'editService',
        'firsttimewizard',
        'gem',
        'gemCbgDetails',
        'my-company',
        'overview',
        'profile',
        'reports',
        'settings',
        'setupwizardmodal',
        'support',
        'trialExtInterest',
        'user-overview',
        'userRedirect',
        'userprofile',
        'users',
      ],
      Support: ['support', 'reports', 'billing', 'cdrsupport', 'cdr-overview', 'cdrladderdiagram'],
      Tech_Support: ['gss'],
      WX2_User: ['overview', 'support', 'activateProduct'],
      WX2_Support: ['overview', 'reports', 'support'],
      WX2_SquaredInviter: [],
      PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'gem', 'gemOverview', 'gemCbgDetails', 'customer-overview', 'partnerreports', 'trial', 'trialAdd', 'trialEdit', 'profile', 'pstnSetup', 'video', 'settings'],
      PARTNER_SALES_ADMIN: ['overview', 'partneroverview', 'customer-overview', 'partnercustomers', 'partnerreports', 'trial', 'trialAdd', 'trialEdit', 'pstnSetup', 'video', 'settings'],
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
        'reports.webex',
        'webex-reports-iframe',
        'services-overview',
      ],
      Application: ['organizations', 'organization-overview'],
      Help_Desk: ['helpdesk', 'helpdesk.search', 'helpdesk.user', 'helpdesk.org', 'helpdesklaunch'],
      Compliance_User: ['ediscovery', 'ediscovery.search', 'ediscovery.reports']
    };

    config.roleStates.Readonly_Admin = _.clone(config.roleStates.Full_Admin);
    config.roleStates.PARTNER_READ_ONLY_ADMIN = _.clone(config.roleStates.PARTNER_ADMIN);

    config.serviceStates = {
      'ciscouc': [
        'addDeviceFlow',
        'autoattendant',
        'callpark',
        'callparkedit',
        'callpickups',
        'device-overview',
        'devices',
        'didadd',
        'huntgroups',
        'huronCallPark',
        'huronCallPickup',
        'huronPickupGroupEdit',
        'hurondetails',
        'huronfeatures',
        'huronHuntGroup',
        'huronPagingGroup',
        'huronPagingGroupEdit',
        'huronlines',
        'huronnewfeature',
        'huronsettings',
        'huntgroupedit',
        'intercomgroups',
        'mediaonhold',
        'paginggroups',
        'place-overview',
        'places',
        'services-overview',
      ],
      'squared-fusion-mgmt': [
        'cluster-details',
        'management-connector-details',
        'services-overview',
        'resource-group-settings',
        'cluster-list',
        'hds.settings', //Temporary  entitlement until updated in org setting
        'hds',
        'hds.list',
        'hds-cluster-details',
        'hds-cluster-settings',
      ],
      'spark-room-system': [
        'addDeviceFlow',
        'device-overview',
        'devices',
        'place-overview',
        'places',
        'huronsettings',
        'huronlines',
      ],
      'squared-fusion-uc': [
        'add-resource',
        'call-service',
        'cluster-list',
        'expressway-settings',
        'services-overview',
      ],
      'squared-fusion-cal': [
        'add-resource',
        'calendar-service',
        'cluster-list',
        'expressway-settings',
        'services-overview',
      ],
      'squared-fusion-gcal': [
        'add-resource',
        'google-calendar-service',
        'cluster-list',
        'services-overview',
      ],
      'squared-team-member': [
        'organization',
      ],
      'spark-hybrid-datasecurity': [
        'hds.settings'
      ],
      'squared-fusion-media': [
        'add-resource',
        'connector-details',
        'connector-details-v2',
        'media-service',
        'media-service-v2',
        'mediafusion-settings',
        'metrics',
        'reports.metrics',
        'reports.media',
        'services-overview',
        'cluster-list',
      ],
      'webex-messenger': [
        'messenger',
        'services-overview',
      ],
      'cloud-contact-center': [
        'care',
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
        'calendar-service',
        'call-service',
        'cluster-list',
        'devices',
        'places',
        'expressway-settings',
        'fusion',
        'hurondetails',
        'huronsettings',
        'media-service',
        'media-service-v2',
        'mediafusion-settings',
        'overview',
        'reports',
        'services-overview',
      ]
    };

    // These states do not require a role/service check
    config.publicStates = ['unauthorized', '404', 'csadmin'];

    config.ciscoOnly = ['billing'];

    return config;
  }

}());
