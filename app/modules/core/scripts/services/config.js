'use strict';

angular.module('Core')
  .factory('Config', ['$window', 'Utils', '$filter',
    function ($window, Utils, $filter) {

      var getCurrentHostname = function () {
        return $window.location.hostname || '';
      };

      var config = {

        adminClientUrl: {
          dev: 'http://127.0.0.1:8000',
          integration: 'https://int-admin.ciscospark.com/',
          prod: 'https://admin.ciscospark.com/',
          cfe: 'https://cfe-admin.ciscospark.com'
        },

        adminServiceUrl: {
          dev: 'http://localhost:8080/atlas-server/admin/api/v1/',
          integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
          prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
          cfe: 'https://atlas-e.wbx2.com/admin/api/v1/'
        },

        locusServiceUrl: {
          dev: 'http://localhost:8080/locus-mount',
          integration: 'https://admin-portal-test-public.wbx2.com/locus',
          prod: 'https://locus-a.wbx2.com'
        },

        meetingServiceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        metricsServiceUrl: {
          dev: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          integration: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          prod: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1'

        },

        thresholdServiceUrl: {
          dev: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          integration: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          prod: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1'

        },

        MeetinginfoserviceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        oauthClientRegistration: {
          atlas: {
            id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
            secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
            scope: 'webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
          },
          cfe: {
            id: 'C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03',
            secret: 'b485aae87723fc2c355547dce67bbe2635ff8052232ad812a689f2f9b9efa048',
            scope: 'webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
          }
        },

        oauthUrl: {
          ciRedirectUrl: 'redirect_uri=%s',
          oauth2UrlAtlas: 'https://idbroker.webex.com/idb/oauth2/v1/',
          oauth2UrlCfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/',
          oauth2LoginUrlPattern: '%sauthorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=random-string&service=%s',
          oauth2ClientUrlPattern: 'grant_type=client_credentials&scope=',
          oauth2CodeUrlPattern: 'grant_type=authorization_code&code=%s&scope=',
          oauth2AccessCodeUrlPattern: 'grant_type=refresh_token&refresh_token=%s&scope=%s'
        },

        feedbackNavConfig: {
          mailto: 'sq-admin-support@cisco.com',
          subject: 'Squared%20Admin%20Feedback'
        },

        utilizationServiceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        ciscoOrgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

        ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

        scimUrl: {
          spark: 'https://identity.webex.com/identity/scim/%s/v1/Users',
          cfe: 'https://identitybts.webex.com/identity/scim/%s/v1/Users'
        },

        scomUrl: {
          spark: 'https://identity.webex.com/organization/scim/v1/Orgs',
          cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs'
        },

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

        healthCheckUrl: {
          dev: 'https://ciscospark.statuspage.io/index.json',
          prod: 'https://ciscospark.statuspage.io/index.json'
        },

        herculesUrl: {
          dev: 'https://hercules-integration.wbx2.com/',
          integration: 'https://hercules-integration.wbx2.com/',
          prod: 'https://hercules-a.wbx2.com/'
        },

        ussUrl: {
          dev: 'https://uss-integration.wbx2.com/',
          integration: 'https://uss-integration.wbx2.com/',
          prod: 'https://uss-a.wbx2.com/'
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
        ssoUrl: 'https://support.ciscospark.com/customer/portal/articles/1909112-sso-setup',
        rolesUrl: 'https://support.ciscospark.com/customer/portal/articles/1908564-overview-of-admin-roles',

        usersperpage: 100,
        meetingsPerPage: 50,

        logConfig: {
          linesToAttach: 100,
          keepOnNavigate: false
        },

        tokenTimers: { //timers: 3000000(50 mins), 39600000(11 hours), 900000(15 mins)
          timeoutTimer: 3000000,
          refreshTimer: 39600000,
          refreshDelay: 900000
        },

        tabs: [{
          tab: 'overviewTab',
          icon: 'icon-home',
          title: 'tabs.overviewTab',
          state: 'overview',
          link: '/overview'
        }, {
          tab: 'overviewTab',
          icon: 'icon-home',
          title: 'tabs.overviewTab',
          state: 'partneroverview',
          link: '/partner/overview'
        }, {
          tab: 'customerTab',
          icon: 'icon-user',
          title: 'tabs.customerTab',
          state: 'partnercustomers',
          link: '/partner/customers'
        }, {
          tab: 'userTab',
          icon: 'icon-user',
          title: 'tabs.userTab',
          state: 'users',
          subPages: [{
              title: 'tabs.listUserTab',
              desc: 'tabs.listUserTabDesc',
              state: 'users.list',
              link: '#users'
            }
            // , {
            //   title: 'tabs.groupTab',
            //   desc: 'tabs.groupTabDesc',
            //   state: 'groups',
            //   link: '#groups'
            // }
          ]
        }, {
          tab: 'servicesTab',
          icon: 'icon-settings',
          title: 'tabs.servicesTab',
          subPages: [{
            title: 'tabs.conferencing',
            desc: 'tabs.conferencingDesc',
            state: 'site-list',
            link: '#site-list'
          }, {
            title: 'tabs.fusionDetailsTab',
            desc: 'tabs.fusionDetailsTabDesc',
            state: 'fusion',
            link: '#fusion'
          }]
        }, {
          tab: 'deviceTab',
          icon: 'icon-devices',
          title: 'tabs.deviceTab',
          state: 'devices',
          link: '/devices'
        }, {
          tab: 'reportTab',
          icon: 'icon-bars',
          title: 'tabs.reportTab',
          state: 'reports',
          link: '/reports'
        }, {
          tab: 'reportTab',
          icon: 'icon-bars',
          title: 'tabs.reportTab',
          state: 'partnerreports',
          link: '/partner/reports'
        }, {
          tab: 'supportTab',
          icon: 'icon-support',
          title: 'tabs.supportTab',
          state: 'support',
          link: '/support'
        }, {
          tab: 'accountTab',
          icon: 'icon-sliders',
          title: 'tabs.accountTab',
          state: 'profile',
          link: '/profile'
        }, {
          tab: 'webexUserSettingsTab',
          icon: 'icon-tools',
          title: 'webexUserSettings.webexUserSettingsTab',
          state: 'webexUserSettings',
          link: '/webexUserSettings'
        }, {
          tab: 'webexUserSettings2Tab',
          icon: 'icon-tools',
          title: 'webexUserSettings2.webexUserSettings2Tab',
          state: 'webexUserSettings2',
          link: '/webexUserSettings2'
        }, {
          tab: 'developmentTab',
          icon: 'icon-tools',
          title: 'tabs.developmentTab',
          subPages: [{
            title: 'tabs.organizationTab',
            desc: 'tabs.organizationTabDesc',
            state: 'organization',
            link: '#organization'
          }, {
            title: 'tabs.callRoutingTab',
            desc: 'tabs.callRoutingTabDesc',
            state: 'callrouting',
            link: '#callrouting'
          }, {
            title: 'tabs.mediaOnHoldTab',
            desc: 'tabs.mediaOnHoldTabDesc',
            state: 'mediaonhold',
            link: '#mediaonhold'
          }, {
            title: 'tabs.metricsDetailsTab',
            desc: 'tabs.metricsDetailsTabDesc',
            state: 'metrics',
            link: '#metrics'
          }, {
            title: 'tabs.thresholdDetailsTab',
            desc: 'tabs.thresholdDetailsTabDesc',
            state: 'threshold',
            link: '#threshold'
          }, {
            title: 'tabs.meetingDetailsTab',
            desc: 'tabs.meetingDetailsTabDesc',
            state: 'meetings',
            link: '#meetings'
          }, {
            title: 'tabs.vtsDetailsTab',
            desc: 'tabs.vtsDetailsTabDesc',
            state: 'vts',
            link: '#vts'
          }, {
            title: 'tabs.reportTab',
            desc: 'New Reports',
            state: 'newpartnerreports',
            link: '#partner/newreports'
          }, {
            title: 'tabs.entResUtilizationTab',
            desc: 'tabs.entResUtilizationTabDesc',
            state: 'utilization',
            link: '#utilization'
          }]
        }],

        entitlements: {
          huron: 'ciscouc',
          fusion: 'squared-fusion-uc',
          mediafusion: 'squared-fusion-media',
          squared: 'webex-squared',
          fusion_uc: 'squared-fusion-uc',
          fusion_cal: 'squared-fusion-cal'
        },

        trials: {
          collab: 'COLLAB',
          squaredUC: 'SQUAREDUC'
        },

        backend_roles: { // as stored in the ci
          full_admin: 'id_full_admin',
          all: 'atlas-portal.all',
          billing: 'atlas-portal.billing',
          support: 'atlas-portal.support',
          application: 'atlas-portal.application',
          reports: 'atlas-portal.reports'
        },

        roles: {
          full_admin: 'Full_Admin',
          all: 'All',
          billing: 'Billing',
          support: 'Support',
          application: 'Application',
          reports: 'Reports'
        },

        roleState: {
          active: 'ACTIVE',
          inactive: 'INACTIVE'
        },

        chartColors: {
          blue: '#1EA7D1',
          red: '#F46315',
          yellow: '#EBC31C',
          green: '#50D71D',
          brandSuccessDark: '#6ab140',
          brandSuccessLight: '#99cf78',
          brandWhite: '#fff',
          grayDarkest: '#444',
          grayDarker: '#666',
          grayLight: '#ccc'
        },

        confMap: {
          CF: 'onboardModal.paidConf',
          EE: 'onboardModal.enterpriseEdition',
          MC: 'onboardModal.meetingCenter',
          SC: 'onboardModal.supportCenter',
          TC: 'onboardModal.trainingCenter',
          EC: 'onboardModal.eventCenter',
          CO: 'onboardModal.communication'
        },

        defaultEntitlements: ['webex-squared', 'squared-call-initiation'],

        batchSize: 20,

        isDev: function () {
          var currentHostname = getCurrentHostname();
          return currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost';
        },

        isIntegration: function () {
          return getCurrentHostname() === 'int-admin.ciscospark.com';
        },

        isProd: function () {
          return getCurrentHostname() === 'admin.ciscospark.com';
        },

        isCfe: function () {
          return getCurrentHostname() === 'cfe-admin.ciscospark.com';
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

        getScimUrl: function () {
          if (this.isCfe()) {
            return this.scimUrl.cfe;
          } else {
            return this.scimUrl.spark;
          }
        },

        getScomUrl: function () {
          if (this.isCfe()) {
            return this.scomUrl.cfe;
          } else {
            return this.scomUrl.spark;
          }
        },

        getAdminServiceUrl: function () {
          if (this.isDev()) {
            return this.adminServiceUrl.integration;
          } else if (this.isCfe()) {
            return this.adminServiceUrl.cfe;
          } else if (this.isIntegration()) {
            return this.adminServiceUrl.integration;
          } else {
            return this.adminServiceUrl.prod;
          }
        },

        getLocusServiceUrl: function () {
          return this.locusServiceUrl.integration;
        },

        getMeetingServiceUrl: function () {
          if (this.isDev()) {
            return this.meetingServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.meetingServiceUrl.integration;
          } else {
            return this.meetingServiceUrl.prod;
          }
        },

        getMeetinginfoserviceUrl: function () {
          if (this.isDev()) {
            return this.MeetinginfoserviceUrl.dev;
          } else if (this.isIntegration()) {
            return this.MeetinginfoserviceUrl.integration;
          } else {
            return this.MeetinginfoserviceUrl.prod;
          }
        },
        getMetricsServiceUrl: function () {
          if (this.isDev()) {
            return this.metricsServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.metricsServiceUrl.integration;
          } else {
            return this.metricsServiceUrl.prod;
          }
        },

        getThresholdServiceUrl: function () {
          if (this.isDev()) {
            return this.thresholdServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.thresholdServiceUrl.integration;
          } else {
            return this.thresholdServiceUrl.prod;
          }
        },

        getFaultServiceUrl: function () {
          if (this.isDev()) {
            return this.thresholdServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.thresholdServiceUrl.integration;
          } else {
            return this.thresholdServiceUrl.prod;
          }
        },

        getClientSecret: function () {
          if (this.isCfe()) {
            return this.oauthClientRegistration.cfe.secret;
          } else {
            return this.oauthClientRegistration.atlas.secret;
          }
        },

        getClientId: function () {
          if (this.isCfe()) {
            return this.oauthClientRegistration.cfe.id;
          } else {
            return this.oauthClientRegistration.atlas.id;
          }
        },

        getOauth2Url: function () {
          if (this.isCfe()) {
            return this.oauthUrl.oauth2UrlCfe;
          } else {
            return this.oauthUrl.oauth2UrlAtlas;
          }
        },

        getOauthLoginUrl: function () {
          var acu = this.adminClientUrl[this.getEnv()] || this.adminClientUrl.prod;
          var params = [
            this.getOauth2Url(),
            this.getClientId(),
            this.oauthClientRegistration.atlas.scope,
            encodeURIComponent(acu),
            this.getOauthServiceType()
          ];
          return Utils.sprintf(this.oauthUrl.oauth2LoginUrlPattern, params);
        },

        getRedirectUrl: function () {
          var acu = this.adminClientUrl[this.getEnv()] || this.adminClientUrl.prod;
          var params = [encodeURIComponent(acu)];
          return Utils.sprintf(this.oauthUrl.ciRedirectUrl, params);
        },

        getOauthCodeUrl: function (code) {
          var params = [code];
          return Utils.sprintf(this.oauthUrl.oauth2CodeUrlPattern, params);
        },

        getOauthAccessCodeUrl: function (refresh_token) {
          var params = [
            refresh_token,
            this.oauthClientRegistration.atlas.scope
          ];
          return Utils.sprintf(this.oauthUrl.oauth2AccessCodeUrlPattern, params);
        },

        getOauthServiceType: function () {
          return 'spark';
        },

        getLogoutUrl: function () {
          var acu = this.adminClientUrl[this.getEnv()] || this.adminClientUrl.prod;
          return this.logoutUrl + encodeURIComponent(acu);
        },

        getAdminPortalUrl: function () {
          return this.adminClientUrl[this.getEnv()];
        },

        getSSOSetupUrl: function () {
          return this.ssoSetupUrl;
        },

        getSSOTestUrl: function () {
          return this.ssoTestUrl;
        },

        getHealthCheckUrlServiceUrl: function () {
          if (this.isDev()) {
            return this.healthCheckUrl.dev;
          } else {
            return this.healthCheckUrl.prod;
          }
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
          return this.herculesUrl[this.getEnv()] || this.herculesUrl.prod;
        },

        getUssUrl: function () {
          return this.ussUrl[this.getEnv()] || this.ussUrl.prod;
        },

        getDefaultEntitlements: function () {
          return this.defaultEntitlements;
        },

        getUtilizationServiceUrl: function () {
          if (this.isDev()) {
            return this.utilizationServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.utilizationServiceUrl.integration;
          } else {
            return this.utilizationServiceUrl.prod;
          }
        },

        getWebexAdvancedHomeUrl: function (siteURL) {
          var params = [siteURL];
          return Utils.sprintf(this.webexUrl.siteAdminHomeUrl, params);
        },

        getWebexAdvancedEditUrl: function (siteURL) {
          var params = [siteURL];
          return Utils.sprintf(this.webexUrl.siteAdminDeepUrl, params);
        },

        getOAuthClientRegistrationCredentials: function () {
          return Utils.Base64.encode(this.getClientId() + ':' + this.getClientSecret());
        }
      };

      config.roleStates = {
        Full_Admin: [
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
          'editService'
        ],
        Support: ['overview', 'reports', 'support'],
        WX2_User: [
          'overview',
          'reports',
          'support'
        ],
        WX2_Support: ['overview', 'reports', 'support'],
        WX2_SquaredInviter: [],
        User: [],
        PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'partnerreports', 'trialAdd', 'trialEdit', 'profile'],
        PARTNER_USER: ['partnercustomers', 'trialAdd', 'trialEdit'],
        CUSTOMER_PARTNER: ['overview', 'partnercustomers'],
        Site_Admin: ['site-list']
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
          'newpartnerreports'
        ],
        'squared-fusion-uc': [
          'fusion',
          'fusion-old',
          'cluster-details',
          'devices'
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
          'fault'
        ]
      };

      // These states do not require a role/service check
      config.allowedStates = ['unauthorized', 'csadmin'];

      return config;
    }
  ]);
