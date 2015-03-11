'use strict';

angular.module('Core')
  .factory('Config', ['$window', 'Utils',
    function ($window, Utils) {

      var getCurrentHostname = function () {
        return $window.location.hostname || '';
      };

      var config = {

        adminClientUrl: {
          dev: 'http://127.0.0.1:8000',
          integration: 'https://int-admin.projectsquared.com/',
          prod: 'https://admin.projectsquared.com/',
          sparkprod: 'https://admin.ciscospark.com/',
          sparkint: 'https://int-admin.ciscospark.com/'
        },

        adminServiceUrl: {
          dev: 'http://localhost:8080/atlas-server/admin/api/v1/',
          integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
          prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
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

        MeetinginfoserviceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        oauthClientRegistration: {
          id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
          secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
          scope: 'webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
        },

        oauthUrl: {
          ciRedirectUrl: 'redirect_uri=%s',
          oauth2Url: 'https://idbroker.webex.com/idb/oauth2/v1/',
          oauth2LoginUrlPattern: '%sauthorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=random-string&service=%s',
          oauth2ClientUrlPattern: 'grant_type=client_credentials&scope=',
          oauth2CodeUrlPattern: 'grant_type=authorization_code&code=%s&scope=',
          oauth2AccessCodeUrlPattern: 'grant_type=refresh_token&refresh_token=%s&scope='
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

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

        ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

        scimUrl: 'https://identity.webex.com/identity/scim/%s/v1/Users',

        scomUrl: 'https://identity.webex.com/organization/scim/v1/Orgs',

        statusPageUrl: 'http://status.projectsquared.com/',

        statusPageUrlSpark: 'http://status.ciscospark.com/',

        logMetricUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',

        callflowServiceUrl: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',

        feedbackUrl: 'https://conv-a.wbx2.com/conversation/api/v1/users/deskFeedbackUrl',

        ciscoOrgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',

        appinfo: {
          webClientURL: 'https://web.projectsquared.com/',
          iPhoneURL: 'https://itunes.apple.com/us/app/project-squared/id833967564?ls=1&mt=8',
          androidURL: 'https://play.google.com/store/apps/details?id=com.cisco.wx2.android',
          androidAppIntent: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
          appURL: 'squared://'
        },

        healthCheckUrl: {
          dev: 'http://projectsquared.statuspage.io/index.json',
          prod: 'https://projectsquared.statuspage.io/index.json',
          spark: 'https://ciscospark.statuspage.io/index.json'
        },

        herculesUrl: {
          dev: 'https://hercules-integration.wbx2.com/',
          integration: 'https://hercules-integration.wbx2.com/',
          prod: 'https://hercules-a.wbx2.com/'
        },

        ussUrl: {
          dev: 'https://uss-integration.wbx2.com/',
          integration: 'https://uss-integration.wbx2.com/',
          prod: 'https://uss-integration.wbx2.com/'
        },

        scimSchemas: [
          'urn:scim:schemas:core:1.0',
          'urn:scim:schemas:extension:cisco:commonidentity:1.0'
        ],

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
          /*
          tab: 'webexUserSettingsTab',
          icon: 'icon-support',
          title: 'webexUserSettings.webexUserSettingsTab',
          state: 'webexUserSettings',
          link: '/webexUserSettings'
          */
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
            title: 'tabs.fusionDetailsTab',
            desc: 'tabs.fusionDetailsTabDesc',
            state: 'fusion',
            link: '#fusion'
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

        backend_roles: { // as stored in the backend
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
          green: '#50D71D'
        },

        defaultEntitlements: ['webex-squared', 'squared-call-initiation'],

        batchSize: 20,

        isDev: function () {
          var currentHostname = getCurrentHostname();
          return currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost';
        },

        isIntegration: function () {
          return getCurrentHostname() === 'int-admin.projectsquared.com';
        },

        isProd: function () {
          return getCurrentHostname() === 'admin.projectsquared.com';
        },

        isSparkProd: function () {
          return getCurrentHostname() === 'admin.ciscospark.com';
        },

        isSparkInt: function () {
          return getCurrentHostname() === 'int-admin.ciscospark.com';
        },

        getEnv: function () {
          if (this.isSparkInt()) {
            return 'sparkint';
          } else if (this.isSparkProd()) {
            return 'sparkprod';
          } else if (this.isDev()) {
            return 'dev';
          } else if (this.isIntegration()) {
            return 'integration';
          } else {
            return 'prod';
          }
        },

        getAdminServiceUrl: function () {
          if (this.isDev()) {
            return this.adminServiceUrl.integration;
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

        getOauthLoginUrl: function () {
          var params = [this.oauthUrl.oauth2Url, this.oauthClientRegistration.id, this.oauthClientRegistration.scope, encodeURIComponent(this.adminClientUrl[this.getEnv()]), this.getOauthServiceType()];
          return Utils.sprintf(this.oauthUrl.oauth2LoginUrlPattern, params);
        },

        getRedirectUrl: function () {
          var params = [encodeURIComponent(this.adminClientUrl[this.getEnv()])];
          return Utils.sprintf(this.oauthUrl.ciRedirectUrl, params);
        },

        getOauthCodeUrl: function (code) {
          var params = [code];
          return Utils.sprintf(this.oauthUrl.oauth2CodeUrlPattern, params);
        },

        getOauthAccessCodeUrl: function (refresh) {
          var params = [refresh];
          return Utils.sprintf(this.oauthUrl.oauth2AccessCodeUrlPattern, params);
        },

        getOauthServiceType: function () {
          if (this.getEnv() === 'sparkint' || this.getEnv() === 'sparkprod') {
            return 'spark';
          } else {
            return 'webex-squared';
          }
        },

        getLogoutUrl: function () {
          return this.logoutUrl + encodeURIComponent(this.adminClientUrl[this.getEnv()]);
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

        getCiscoOrgId: function () {
          return this.ciscoOrgId;
        },

        getHealthCheckUrlServiceUrl: function () {
          if (this.isSparkInt() || this.isSparkProd()) {
            return this.healthCheckUrl.spark;
          } else if (this.isDev()) {
            return this.healthCheckUrl.prod;
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
          if (this.isSparkInt() || this.isSparkProd()) {
            return this.statusPageUrlSpark;
          } else {
            return this.statusPageUrl;
          }
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
          return this.herculesUrl[this.getEnv()];
        },

        getUssUrl: function () {
          return this.ussUrl[this.getEnv()];
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
        }

      };

      config.roleStates = {
        Full_Admin: [
          // 'webexUserSettings',
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
          // 'webexUserSettings',
          'overview',
          'reports',
          'support'
        ],
        WX2_Support: ['overview', 'reports', 'support'],
        WX2_SquaredInviter: [],
        User: [],
        PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'partnerreports', 'trialAdd', 'trialEdit', 'profile'],
        PARTNER_USER: ['partneroverview', 'partnerreports'],
        CUSTOMER_PARTNER: ['partnercustomers']
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
        'squared-fusion-uc': ['fusion', 'devices'],
        'squared-team-member': ['organization'],
        'squared-fusion-media': ['meetings', 'vts', 'utilization']
      };

      // These states do not require a role/service check
      config.allowedStates = ['unauthorized'];

      return config;
    }
  ]);
