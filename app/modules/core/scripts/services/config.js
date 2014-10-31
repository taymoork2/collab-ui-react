'use strict';

angular.module('Core')
  .factory('Config', ['$window', 'Utils',
    function($window, Utils) {
      var config = {

        adminClientUrl: {
          dev: 'http://127.0.0.1:8000',
          integration: 'https://int-admin.wbx2.com/',
          prod: 'https://admin.projectsquared.com/'
        },

        adminServiceUrl: {
          dev: 'http://localhost:8080/atlas-server/admin/api/v1/',
          integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
          prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
        },

        locusServiceUrl: {
          dev: 'http://localhost:8080/locus-mount',
          integration: 'http://admin-portal-test-public.wbx2.com:8080/locus',
          prod: 'https://locus-a.wbx2.com'
        },

        oauthClientRegistration: {
          id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
          secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
          scope: 'webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
        },

        oauthUrl: {
          ciRedirectUrl: 'redirect_uri=%s',
          oauth2Url: 'https://idbroker.webex.com/idb/oauth2/v1/',
          oauth2LoginUrlPattern: '%sauthorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=random-string&service=webex-squared',
          oauth2ClientUrlPattern: 'grant_type=client_credentials&scope=',
          oauth2CodeUrlPattern: 'grant_type=authorization_code&code=%s&scope=',
          oauth2AccessCodeUrlPattern: 'grant_type=refresh_token&refresh_token=%s&scope='
        },

        feedbackNavConfig: {
          mailto: 'sq-admin-support@cisco.com',
          subject: 'Squared%20Admin%20Feedback'
        },

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

        ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

        scimUrl: 'https://identity.webex.com/identity/scim/%s/v1/Users',

        scomUrl: 'https://identity.webex.com/organization/scim/v1/Orgs',

        statusPageUrl: 'http://status.projectsquared.com/',

        logMetricUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',

        callflowServiceUrl: 'http://admin-portal-test-public.wbx2.com:8080/atlas-server/admin/api/v1/',

        appinfo: {
          webClientURL: 'https://web.projectsquared.com/',
          iPhoneURL: 'https://itunes.apple.com/us/app/project-squared/id833967564?ls=1&mt=8',
          androidURL: 'https://play.google.com/store/apps/details?id=com.cisco.wx2.android',
          androidAppIntent: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
          appURL: 'squared://'
        },


        healthCheckUrl: {
          dev: 'http://status.projectsquared.com/index.json',
          prod: 'http://status.projectsquared.com/index.json'
        },

        scimSchemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],

        usersperpage: 100,

        logConfig: {
          linesToAttach: 100,
          keepOnNavigate: false
        },

        tokenTimers: { //timers: 3000000(50 mins), 2700000(45 mins), 900000(15 mins)
          timeoutTimer: 3000000,
          refreshTimer: 2700000,
          refreshDelay: 900000
        },

        tabs: [{
          index: 0,
          name: 'home',
          tab: 'homeTab',
          title: 'tabs.homeTab',
          state: 'home',
          link: '/home'
        }, {
          index: 1,
          name: 'partnerhome',
          tab: 'homeTab',
          title: 'tabs.homeTab',
          state: 'partnerhome',
          link: '/partnerhome'
        }, {
          index: 2,
          name: 'manage',
          tab: 'orgTab',
          title: 'tabs.orgTab',
          subPages: [{
            index: 0,
            name: 'users',
            title: 'tabs.userTab',
            desc: 'tabs.userTabDesc',
            state: 'users',
            link: '#users'
          }, {
            index: 1,
            name: 'spaces',
            title: 'tabs.spacesTab',
            desc: 'tabs.spacesTabDesc',
            state: 'spaces',
            link: '#spaces',
          }, {
            index: 2,
            name: 'organizations',
            title: 'tabs.orgDetailsTab',
            desc: 'tabs.orgDetailsTabDesc',
            state: 'orgs',
            link: '#orgs'
          }, {
            index: 3,
            title: 'tabs.fusionDetailsTab',
            desc: 'tabs.fusionDetailsTabDesc',
            state: 'fusion',
            link: '#fusion'
          }, {
            index: 4,
            name: 'callrouting',
            title: 'tabs.callRoutingTab',
            desc: 'tabs.callRoutingTabDesc',
            state: 'callrouting',
            link: '#callrouting'
          }]
        }, {
          index: 3,
          name: 'partnermanage',
          tab: 'orgTab',
          title: 'tabs.orgTab',
          subPages: [{
            index: 0,
            name: 'customers',
            title: 'tabs.customersTab',
            desc: 'tabs.customersTabDesc',
            state: 'customers',
            link: '#customers'
          }]
        }, {
          index: 4,
          name: 'reports',
          tab: 'reportTab',
          title: 'tabs.reportTab',
          state: 'reports',
          link: '/reports'
        }, {
          index: 5,
          name: 'partnerreports',
          tab: 'reportTab',
          title: 'tabs.reportTab',
          state: 'partnerreports',
          link: '/partnerreports'
        }, {
          index: 6,
          name: 'support',
          tab: 'supportTab',
          title: 'tabs.supportTab',
          state: 'support',
          link: '/support'
        }],

        entitlements: {
          squared: 'webex-squared',
          huron: 'ciscouc',
          fusion: 'squared-fusion-uc'
        },

        batchSize: 20,

        isDev: function() {
          return document.URL.indexOf('127.0.0.1') !== -1 || document.URL.indexOf('localhost') !== -1;
        },

        isIntegration: function() {
          return document.URL.indexOf('int-admin.wbx2.com') !== -1;
        },

        isProd: function() {
          return document.URL.indexOf('admin.projectsquared.com') !== -1;
        },

        getEnv: function() {
          if (this.isDev()) {
            return 'dev';
          } else if (this.isIntegration()) {
            return 'integration';
          } else {
            return 'prod';
          }

        },

        getAdminServiceUrl: function() {
          if (this.isDev()){
            return this.adminServiceUrl.integration;
          } else if(this.isIntegration()) {
            return this.adminServiceUrl.integration;
          } else {
            return this.adminServiceUrl.prod;
          }
        },

        getLocusServiceUrl: function() {
          return this.locusServiceUrl.integration;
        },

        getOauthLoginUrl: function() {
          var params = [this.oauthUrl.oauth2Url, this.oauthClientRegistration.id, this.oauthClientRegistration.scope, encodeURIComponent(this.adminClientUrl[this.getEnv()])];
          return Utils.sprintf(this.oauthUrl.oauth2LoginUrlPattern, params);
        },

        getRedirectUrl: function() {
          var params = [encodeURIComponent(this.adminClientUrl[this.getEnv()])];
          return Utils.sprintf(this.oauthUrl.ciRedirectUrl, params);
        },

        getOauthCodeUrl: function(code) {
          var params = [code];
          return Utils.sprintf(this.oauthUrl.oauth2CodeUrlPattern, params);
        },

        getOauthAccessCodeUrl: function(refresh) {
          var params = [refresh];
          return Utils.sprintf(this.oauthUrl.oauth2AccessCodeUrlPattern, params);
        },

        getLogoutUrl: function() {
          return this.logoutUrl + encodeURIComponent(this.adminClientUrl[this.getEnv()]);
        },

        getSSOSetupUrl: function() {
          return this.ssoSetupUrl;
        },

        getSSOTestUrl: function() {
          return this.ssoTestUrl;
        },

        getHealthCheckUrlServiceUrl: function() {
          if (this.isDev()) {
            return this.healthCheckUrl.prod;
          } else {
            return this.healthCheckUrl.prod;
          }
        },

        getLogMetricsUrl: function() {
          return this.logMetricUrl;
        },

        getCallflowServiceUrl: function() {
          return this.callflowServiceUrl;
        },

        getStatusPageUrl: function() {
          return this.statusPageUrl;
        },

        getSquaredAppUrl: function() {
          return this.appinfo.appURL;
        },

        getItunesStoreUrl: function() {
          return this.appinfo.iPhoneURL;
        },

        getAndroidStoreUrl: function() {
          return this.appinfo.androidURL;
        },

        getAndroidAppIntent: function() {
          return this.appinfo.androidAppIntent;
        },

        getWebClientUrl: function() {
          return this.appinfo.webClientURL;
        }

      };

      config.roleStates = {
        Full_Admin: [
          'home', 'users', 'userprofile', 'spaces', 'orgs', 'reports',
          'initialsetup', 'initialsetup.accountreview', 'initialsetup.servicesetup', 'initialsetup.adduser', 'initialsetup.getstarted'
        ],
        WX2_User: ['home', 'reports', 'support'],
        WX2_Support: ['home', 'reports', 'support'],
        WX2_SquaredInviter: [],
        User: [],
        PARTNER_ADMIN: [],
        PARTNER_USER: ['partnerhome', 'customers', 'partnerreports']
      };

      config.serviceStates = {
        'ciscouc': ['callrouting'],
        'squared-fusion-uc': ['fusion']
      };

      // These states do not require a role/service check
      config.allowedStates = ['unauthorized'];

      return config;
    }
  ]);
