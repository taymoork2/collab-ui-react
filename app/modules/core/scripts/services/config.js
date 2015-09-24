'use strict';

angular.module('Core')
  .factory('Config', ['$location', 'Utils', '$filter',
    function ($location, Utils, $filter) {

      var oauth2Scope = encodeURIComponent('webexsquare:admin ciscouc:admin Identity:SCIM Identity:Config Identity:Organization cloudMeetings:login webex-messenger:get_webextoken ccc_config:admin');

      var getCurrentHostname = function () {
        return $location.host() || '';
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

        enrollmentServiceUrl: {
          dev: 'http://localhost:8080/locus-mount/locus/api/v1',
          integration: 'https://locus-integration.wbx2.com/locus/api/v1',
          prod: 'https://locus-a.wbx2.com/locus/api/v1'
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

        alarmServiceUrl: {
          dev: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice',
          integration: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice',
          prod: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice'

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

        csdmServiceUrl: {
          dev: 'http://localhost:8080/csdm-server/csdm/api/v1',
          integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
          prod: 'https://csdm-a.wbx2.com/csdm/api/v1',
          cfe: 'https://csdm-e.wbx2.com/csdm/api/v1'
        },

        oauthClientRegistration: {
          atlas: {
            id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
            secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
            scope: oauth2Scope
          },
          cfe: {
            id: 'C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03',
            secret: 'b485aae87723fc2c355547dce67bbe2635ff8052232ad812a689f2f9b9efa048',
            scope: oauth2Scope
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

        ciscoMockOrgId: 'd30a6828-dc35-4753-bab4-f9b468828688',

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        oauthDeleteTokenUrl: 'https://idbroker.webex.com/idb/oauth2/v1/revoke',

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

        sunlightConfigServiceUrl: {
          dev: 'https://config.integration-tx1.thunderhead.io/config/v1',
          integration: 'https://config.integration-tx1.thunderhead.io/config/v1',
          prod: 'https://config.integration-tx1.thunderhead.io/config/v1', //This will change to prod later in future
        },

        scimSchemas: [
          'urn:scim:schemas:core:1.0',
          'urn:scim:schemas:extension:cisco:commonidentity:1.0'
        ],

        helpUrl: 'https://support.ciscospark.com',
        ssoUrl: 'https://support.ciscospark.com/customer/portal/articles/1909112-sso-setup',
        rolesUrl: 'https://support.ciscospark.com/customer/portal/articles/1908564-overview-of-admin-roles',
        supportUrl: 'https://help.webex.com/community/cisco-cloud-collab-mgmt',

        usersperpage: 100,
        meetingsPerPage: 50,
        alarmsPerPage: 50,
        eventsPerPage: 50,

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
          link: '/users'
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
            title: 'tabs.huronLineDetailsTab',
            desc: 'tabs.huronLineDetailsTabDesc',
            state: 'hurondetails',
            link: '#hurondetails'
          }, {
            title: 'tabs.fusionDetailsTab',
            desc: 'tabs.fusionDetailsTabDesc',
            state: 'fusion',
            link: '#fusion'
          }, {
            title: 'tabs.MediafusionDetailsTab',
            desc: 'tabs.MediafusionDetailsTabDesc',
            state: 'mediafusionconnector',
            link: '#mediafusionconnector'
          }, {
            title: 'Messenger',
            desc: 'Messenger Administration',
            state: 'messenger',
            link: '#messenger'
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
          subPages: [{
            title: 'tabs.logsTab',
            desc: 'tabs.logsTabDesc',
            state: 'support',
            link: '#support'
          }, {
            title: 'tabs.billingTab',
            desc: 'tabs.billingTabDesc',
            state: 'billing',
            link: '#orderprovisioning'
          }]
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
            title: 'tabs.addOrganizationTab',
            desc: 'tabs.addOrganizationTabDesc',
            state: 'organizationAdd',
            link: '#add-organization'
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
          }, {
            title: 'tabs.alarmsTab',
            desc: 'tabs.alarmsTabDesc',
            state: 'alarms',
            link: '#alarms'
          }, {
            title: 'tabs.eventsTab',
            desc: 'tabs.eventsTabDesc',
            state: 'events',
            link: '#events'
          }]
        }],

        entitlements: {
          huron: 'ciscouc',
          squared: 'webex-squared',
          fusion_uc: 'squared-fusion-uc',
          fusion_cal: 'squared-fusion-cal',
          mediafusion: 'squared-fusion-media',
          fusion_mgmt: 'squared-fusion-mgmt'
        },

        trials: {
          collab: 'COLLAB',
          squaredUC: 'SQUAREDUC'
        },

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
          sales: 'atlas-portal.partner.salesadmin'
        },

        roles: {
          full_admin: 'Full_Admin',
          all: 'All',
          billing: 'Billing',
          support: 'Support',
          application: 'Application',
          reports: 'Reports',
          sales: 'Sales_Admin'
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
          dummyGrayLight: '#F3F3F3',
          dummyGrayLighter: '#FAFAFA'
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

        batchSize: 10,

        isDev: function () {
          var currentHostname = getCurrentHostname();
          return currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost' || currentHostname === 'server';
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

        getScimUrl: function (orgId) {
          var params = [orgId];
          if (this.isCfe()) {
            return Utils.sprintf(this.scimUrl.cfe, params);
          } else {
            return Utils.sprintf(this.scimUrl.spark, params);
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

        getCsdmServiceUrl: function () {
          if (this.isDev()) {
            return this.csdmServiceUrl.integration;
          } else if (this.isCfe()) {
            return this.csdmServiceUrl.cfe;
          } else if (this.isIntegration()) {
            return this.csdmServiceUrl.integration;
          } else {
            return this.csdmServiceUrl.prod;
          }
        },

        getLocusServiceUrl: function () {
          return this.locusServiceUrl.integration;
        },

        getFeatureToggleUrl: function () {
          return this.locusServiceUrl.prod;
        },

        getEnrollmentServiceUrl: function () {
          if (this.isDev()) {
            return this.enrollmentServiceUrl.integration;
          } else if (this.isIntegration()) {
            return this.enrollmentServiceUrl.integration;
          } else {
            return this.enrollmentServiceUrl.prod;
          }
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

        getAlarmServiceUrl: function () {
          if (this.isDev()) {
            return this.alarmServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.alarmServiceUrl.integration;
          } else {
            return this.alarmServiceUrl.prod;
          }
        },

        getEventServiceUrl: function () {
          if (this.isDev()) {
            return this.alarmServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.alarmServiceUrl.integration;
          } else {
            return this.alarmServiceUrl.prod;
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

        getOauthDeleteTokenUrl: function () {
          return this.oauthDeleteTokenUrl;
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
        },

        getSunlightConfigServiceUrl: function () {

          if (this.isDev()) {
            return this.sunlightConfigServiceUrl.dev;
          } else if (this.isIntegration()) {
            return this.sunlightConfigServiceUrl.integration;
          } else {
            return this.sunlightConfigServiceUrl.prod;
          }
        }

      };

      config.roleStates = {
        Full_Admin: [ // Customer Admin
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
          'trialExtInterest'
        ],
        Support: ['support', 'reports', 'billing'],
        WX2_User: ['overview', 'reports', 'support'],
        WX2_Support: ['overview', 'reports', 'support'],
        WX2_SquaredInviter: [],
        PARTNER_ADMIN: ['partneroverview', 'partnercustomers', 'customer-overview', 'partnerreports', 'trialAdd', 'trialEdit', 'profile', 'pstnSetup'],
        PARTNER_USER: ['partnercustomers', 'customer-overview', 'trialAdd', 'trialEdit'],
        CUSTOMER_PARTNER: ['overview', 'partnercustomers', 'customer-overview'],
        User: [],
        Site_Admin: ['site-list'],
        Application: ['organizationAdd']
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
          'newpartnerreports',
          'callRouter',
          'hurondetails',
          'huronlines',
          'huronsettings',
          'huronfeatures'
        ],
        'squared-fusion-mgmt': [
          'fusion',
          'cluster-details',
          'calendar-service'
        ],
        'squared-fusion-uc': [
          'devices',
          'device-overview',
          'devices-redux2',
          'devices-redux3',
          'devices-redux4'
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
          'mediafusionconnector',
          'connector-details'
        ]
      };

      // These states are not allowed in specific views
      // (i.e. devices are not allowed in partner)
      config.restrictedStates = {
        'customer': [
          'partneroverview',
          'partnerreports',
          'newpartnerreports'
        ],
        'partner': [
          'overview',
          'reports',
          'devices',
          'fusion',
          'mediafusionconnector',
          'callRouter',
          'hurondetails'
        ]
      };

      // These states do not require a role/service check
      config.allowedStates = ['unauthorized', 'csadmin'];

      config.ciscoOnly = ['billing'];

      // Messenger Sep 2015: Temporarily hide new state so only developers can see it.
      // This will be changed once the back-end service is operational.
      if (config.isDev()) {
        config.serviceStates['webex-messenger'] = [
          'messenger'
        ];
      }

      return config;
    }
  ]);
