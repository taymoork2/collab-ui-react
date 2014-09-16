'use strict';

angular.module('Core')
  .factory('Config', ['$window', 'Utils',
    function($window, Utils) {
      var config = {

        adminClientUrl: {
          dev: 'http://127.0.0.1:8000',
          integration: 'https://int-admin.wbx2.com/',
          prod: 'https://admin.wbx2.com/'
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

        oauth2LoginUrlPattern: '%sauthorize?response_type=token&client_id=%s&scope=%s&redirect_uri=%s&state=random-string&service=webex-squared',

        oauthClientRegistration: {
          id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
          secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
          scope: 'webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
        },

        oauth2Url: 'https://idbroker.webex.com/idb/oauth2/v1/',

        feedbackNavConfig: {
          mailto: 'sq-admin-support@cisco.com',
          subject: 'Squared%20Admin%20Feedback'
        },

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

        ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

        scimUrl: 'https://identity.webex.com/identity/scim/%s/v1/Users',

        scomUrl: 'https://identity.webex.com/organization/scim/v1/Orgs',

        statusPageUrl: 'http://status.squaredpreview.com/',

        logMetricUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',

        squaredAppUrl: 'squared://',

        healthCheckUrl: {
          dev: 'http://squaredpreview.statuspage.io/index.json',
          prod: 'https://squaredpreview.statuspage.io/index.json'
        },

        scimSchemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],

        usersperpage: 20,

        logConfig: {
          linesToAttach: 100,
          keepOnNavigate: false
        },

        allowedPaths: ['/activate', '/downloads', '/invite', '/invitelauncher', '/applauncher'],

        tabs: {
          home: {
            tab: 'homeTab',
            title: 'tabs.homeTab',
            link: '/home'
          },
          orgs: {
            tab: 'orgTab',
            title: 'tabs.orgTab',
            subPages: [{
              title: 'tabs.userTab',
              desc: 'tabs.userTabDesc',
              link: '#users'
            }, {
              title: 'tabs.spacesTab',
              desc: 'tabs.spacesTabDesc',
              link: '#spaces',
            },{
              title: 'tabs.orgDetailsTab',
              desc: 'tabs.orgDetailsTabDesc',
              link: '#orgs'
            }]
          },
          reports: {
            tab: 'reportTab',
            title: 'tabs.reportTab',
            link: '/reports'
          },
          support: {
            tab: 'supportTab',
            title: 'tabs.supportTab',
            link: '/support'
          }
        },

        entitlements: {
          squared: 'webex-squared',
          huron: 'huron'
        },
        batchSize: 20,

        isDev: function() {
          return document.URL.indexOf('127.0.0.1') !== -1 || document.URL.indexOf('localhost') !== -1;
        },

        isIntegration: function() {
          return document.URL.indexOf('int-admin.wbx2.com') !== -1;
        },

        isProd: function() {
          return document.URL.indexOf('admin.wbx2.com') !== -1;
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
          if (this.isDev() || this.isIntegration()) {
            return this.adminServiceUrl.integration;
          } else {
            return this.adminServiceUrl.prod;
          }
        },

        getLocusServiceUrl: function() {
          return this.locusServiceUrl.integration;
        },

        getOauthLoginUrl: function() {
          var params = [this.oauth2Url, this.oauthClientRegistration.id, this.oauthClientRegistration.scope, encodeURIComponent(this.adminClientUrl[this.getEnv()])];
          return Utils.sprintf(this.oauth2LoginUrlPattern, params);
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

        getStatusPageUrl: function() {
          return this.statusPageUrl;
        },

        getSquaredAppUrl: function() {
          return this.squaredAppUrl;
        }

      };

      config.roles = {
        Full_Admin: [config.tabs.home, config.tabs.users, config.tabs.orgs, config.tabs.reports, config.tabs.spaces],
        WX2_User: [config.tabs.home, config.tabs.reports, config.tabs.support, config.tabs.spaces],
        WX2_Support: [config.tabs.home, config.tabs.reports, config.tabs.support, config.tabs.spaces],
        WX2_SquaredInviter: [],
        User: []
      };

      return config;
    }
  ]);
