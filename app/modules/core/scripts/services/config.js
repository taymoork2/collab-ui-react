'use strict';

angular.module('Core')
  .factory('Config', ['$location', 'Utils', '$filter', 'Storage',
    function ($location, Utils, $filter, Storage) {

      var oauth2Scope = encodeURIComponent('webexsquare:admin ciscouc:admin Identity:SCIM Identity:Config Identity:Organization cloudMeetings:login webex-messenger:get_webextoken ccc_config:admin');
      var isProdBackend = isProductionBackend();
      var getCurrentHostname = function () {
        return $location.host() || '';
      };

      var config = {

        adminClientUrl: {
          dev: 'http://127.0.0.1:8000',
          cfe: 'https://cfe-admin.ciscospark.com',
          integration: 'https://int-admin.ciscospark.com/',
          prod: 'https://admin.ciscospark.com/'
        },

        adminServiceUrl: {
          dev: 'http://localhost:8080/atlas-server/admin/api/v1/',
          cfe: 'https://atlas-e.wbx2.com/admin/api/v1/',
          integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
          prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
        },

        locusServiceUrl: {
          dev: 'http://localhost:8080/locus-mount',
          cfe: 'https://locus-e.wbx2.com',
          integration: 'https://admin-portal-test-public.wbx2.com/locus',
          prod: 'https://locus-a.wbx2.com'
        },

        enrollmentServiceUrl: {
          dev: 'http://localhost:8080/locus-mount/locus/api/v1',
          cfe: 'https://locus-e.wbx2.com/locus/api/v1',
          integration: 'https://locus-integration.wbx2.com/locus/api/v1',
          prod: 'https://locus-a.wbx2.com/locus/api/v1'
        },

        meetingServiceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        metricsServiceUrl: {
          dev: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          cfe: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          integration: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          prod: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1'

        },

        alarmServiceUrl: {
          dev: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice',
          cfe: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice',
          integration: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice',
          prod: 'http://multimediafusion-cf-fault.mmf-cf.huron.uno/mediafusion/v1/faultservice'
        },

        thresholdServiceUrl: {
          dev: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          cfe: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          integration: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1',
          prod: 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1'
        },

        meetingInfoServiceUrl: {
          dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        csdmServiceUrl: {
          dev: 'http://localhost:8080/csdm-server/csdm/api/v1',
          cfe: 'https://csdm-e.wbx2.com/csdm/api/v1',
          integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
          prod: 'https://csdm-a.wbx2.com/csdm/api/v1'
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
          cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
          prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
        },

        ciscoOrgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',

        ciscoMockOrgId: 'd30a6828-dc35-4753-bab4-f9b468828688',

        consumerOrgId: 'consumer',

        logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

        oauthDeleteTokenUrl: 'https://idbroker.webex.com/idb/oauth2/v1/revoke',

        ssoSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

        ssoTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',

        scimUrl: {
          dev: 'https://identity.webex.com/identity/scim/%s/v1/Users',
          cfe: 'https://identitybts.webex.com/identity/scim/%s/v1/Users',
          integration: 'https://identity.webex.com/identity/scim/%s/v1/Users',
          prod: 'https://identity.webex.com/identity/scim/%s/v1/Users'
        },

        userReportsUrl: {
          dev: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
          cfe: 'https://identitybts.webex.com/identity/config/%s/v1/UserReports',
          integration: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
          prod: 'https://identity.webex.com/identity/config/%s/v1/UserReports'
        },

        scomUrl: {
          dev: 'https://identity.webex.com/organization/scim/v1/Orgs',
          cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs',
          integration: 'https://identity.webex.com/organization/scim/v1/Orgs',
          prod: 'https://identity.webex.com/organization/scim/v1/Orgs'
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
          cfe: 'https://ciscospark.statuspage.io/index.json',
          integration: 'https://ciscospark.statuspage.io/index.json',
          prod: 'https://ciscospark.statuspage.io/index.json'
        },

        herculesUrl: {
          dev: 'https://hercules-integration.wbx2.com/v1',
          cfe: 'https://hercules-e.wbx2.com/v1',
          integration: 'https://hercules-integration.wbx2.com/v1',
          prod: 'https://hercules-a.wbx2.com/v1'
        },

        ussUrl: {
          dev: 'https://uss-integration.wbx2.com/',
          cfe: 'https://uss-e.wbx2.com/',
          integration: 'https://uss-integration.wbx2.com/',
          prod: 'https://uss-a.wbx2.com/'
        },

        certsUrl: {
          dev: 'https://certs-integration.wbx2.com/',
          cfe: 'https://certs-e.wbx2.com/',
          integration: 'https://certs-integration.wbx2.com/',
          prod: 'https://certs-a.wbx2.com/'
        },

        webexUrl: {
          siteAdminHomeUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
          siteAdminDeepUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage'
        },

        wdmUrl: {
          dev: 'https://wdm-a.wbx2.com/wdm/api/v1',
          cfe: 'http://wdm.cfe.wbx2.com/wdm/api/v1',
          integration: 'http://wdm.integration.wbx2.com/wdm/api/v1',
          prod: 'http://wdm.cfa.wbx2.com/wdm/api/v1',
        },

        sunlightConfigServiceUrl: {
          dev: 'https://config.integration-tx1.thunderhead.io/config/v1',
          cfe: 'https://config.integration-tx1.thunderhead.io/config/v1',
          integration: 'https://config.integration-tx1.thunderhead.io/config/v1',
          prod: 'https://config.integration-tx1.thunderhead.io/config/v1' //This will change to prod later in future
        },

        calliopeUrl: {
          dev: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
          cfe: 'https://calliope-e.wbx2.com/calliope/api/authorization/v1',
          integration: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
          prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1'
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
            state: 'huronsettings',
            link: '#hurondetails/settings'
          }, {
            title: 'tabs.fusionDetailsTab',
            desc: 'tabs.fusionDetailsTabDesc',
            state: 'fusion',
            link: '#fusion'
          }, {
            title: 'tabs.expresswayManagementServiceTab',
            desc: 'tabs.expresswayManagementServiceTabDesc',
            state: 'management-service',
            link: '#/services/expressway-management'
          }, {
            title: 'tabs.calendarServiceTab',
            desc: 'tabs.calendarServiceTabDesc',
            state: 'calendar-service',
            link: '#/services/calendar'
          }, {
            title: 'tabs.callServiceTab',
            desc: 'tabs.callServiceTabDesc',
            state: 'call-service',
            link: '#/services/call'
          }, {
            title: 'tabs.MediafusionDetailsTab',
            desc: 'tabs.MediafusionDetailsTabDesc',
            state: 'mediafusionconnector',
            link: '#mediafusionconnector'
          }, {
            title: 'tabs.messengerTab',
            desc: 'tabs.messengerTabDesc',
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
          tab: 'developmentTab',
          icon: 'icon-tools',
          title: 'tabs.developmentTab',
          subPages: [{
            title: 'tabs.organizationTab',
            desc: 'tabs.organizationTabDesc',
            state: 'organizations',
            link: '#organizations'
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
            title: 'tabs.cdrTab',
            desc: 'tabs.cdrLogsTabDesc',
            state: 'cdrsupport',
            link: '#cdrsupport'
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
          }, {
            title: 'tabs.reportTab',
            desc: 'reportsPage.devReports',
            state: 'devReports',
            link: '#devReports'
          }]
        }],

        entitlements: {
          huron: 'ciscouc',
          squared: 'webex-squared',
          fusion_uc: 'squared-fusion-uc',
          fusion_cal: 'squared-fusion-cal',
          mediafusion: 'squared-fusion-media',
          fusion_mgmt: 'squared-fusion-mgmt',
          device_mgmt: 'spark-device-mgmt',
          fusion_ec: 'squared-fusion-ec'
        },

        trials: {
          collab: 'COLLAB',
          squaredUC: 'SQUAREDUC',
          webex: 'WEBEXTRIALS',
          cloudberry: 'ROOMSYSTEMS',
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
          dummyGrayLight: '#F3F3F3',
          dummyGrayLighter: '#FAFAFA'
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
          CO: 'CO' // Communication
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
          return !isProdBackend && (currentHostname === '127.0.0.1' || currentHostname === '0.0.0.0' || currentHostname === 'localhost' || currentHostname === 'server');
        },

        isIntegration: function () {
          return !isProdBackend && getCurrentHostname() === 'int-admin.ciscospark.com';
        },

        isProd: function () {
          return getCurrentHostname() === 'admin.ciscospark.com';
        },

        isCfe: function () {
          return !isProdBackend && getCurrentHostname() === 'cfe-admin.ciscospark.com';
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
            'dev': Utils.sprintf(this.scimUrl.dev, params),
            'cfe': Utils.sprintf(this.scimUrl.cfe, params),
            'integration': Utils.sprintf(this.scimUrl.integration, params),
            'prod': Utils.sprintf(this.scimUrl.prod, params)
          };

          return scimUrl[this.getEnv()];
        },

        getUserReportsUrl: function (orgId) {
          var params = [orgId];
          var userReportsUrl = {
            'dev': Utils.sprintf(this.userReportsUrl.dev, params),
            'cfe': Utils.sprintf(this.userReportsUrl.cfe, params),
            'integration': Utils.sprintf(this.userReportsUrl.integration, params),
            'prod': Utils.sprintf(this.userReportsUrl.prod, params)
          };

          return userReportsUrl[this.getEnv()];
        },

        getScomUrl: function () {
          var scomUrl = {
            'dev': this.scomUrl.dev,
            'cfe': this.scomUrl.cfe,
            'integration': this.scomUrl.integration,
            'prod': this.scomUrl.prod
          };

          return scomUrl[this.getEnv()];
        },

        getAdminServiceUrl: function () {
          var adminServiceUrl = {
            'dev': this.adminServiceUrl.integration,
            'cfe': this.adminServiceUrl.cfe,
            'integration': this.adminServiceUrl.integration,
            'prod': this.adminServiceUrl.prod
          };

          return adminServiceUrl[this.getEnv()];
        },

        getProdAdminServiceUrl: function () {
          return this.adminServiceUrl.prod;
        },

        getCsdmServiceUrl: function () {
          var csdmServiceUrl = {
            'dev': this.csdmServiceUrl.integration,
            'cfe': this.csdmServiceUrl.cfe,
            'integration': this.csdmServiceUrl.integration,
            'prod': this.csdmServiceUrl.prod
          };

          return csdmServiceUrl[this.getEnv()];
        },

        getLocusServiceUrl: function () {
          return this.locusServiceUrl.integration;
        },

        getFeatureToggleUrl: function () {
          return this.locusServiceUrl.prod;
        },

        getEnrollmentServiceUrl: function () {
          var enrollmentServiceUrl = {
            'dev': this.enrollmentServiceUrl.integration,
            'cfe': this.enrollmentServiceUrl.cfe,
            'integration': this.enrollmentServiceUrl.integration,
            'prod': this.enrollmentServiceUrl.prod
          };

          return enrollmentServiceUrl[this.getEnv()];
        },

        getMeetingServiceUrl: function () {
          var meetingServiceUrl = {
            'dev': this.meetingServiceUrl.dev,
            'cfe': this.meetingServiceUrl.cfe,
            'integration': this.meetingServiceUrl.integration,
            'prod': this.meetingServiceUrl.prod
          };

          return meetingServiceUrl[this.getEnv()];
        },

        getMeetingInfoServiceUrl: function () {
          var meetingInfoServiceUrl = {
            'dev': this.meetingInfoServiceUrl.dev,
            'cfe': this.meetingInfoServiceUrl.cfe,
            'integration': this.meetingInfoServiceUrl.integration,
            'prod': this.meetingInfoServiceUrl.prod
          };

          return meetingInfoServiceUrl[this.getEnv()];
        },

        getMetricsServiceUrl: function () {
          var metricsServiceUrl = {
            'dev': this.metricsServiceUrl.dev,
            'cfe': this.metricsServiceUrl.cfe,
            'integration': this.metricsServiceUrl.integration,
            'prod': this.metricsServiceUrl.prod
          };

          return metricsServiceUrl[this.getEnv()];
        },

        getThresholdServiceUrl: function () {
          var thresholdServiceUrl = {
            'dev': this.thresholdServiceUrl.dev,
            'cfe': this.thresholdServiceUrl.cfe,
            'integration': this.thresholdServiceUrl.integration,
            'prod': this.thresholdServiceUrl.prod
          };

          return thresholdServiceUrl[this.getEnv()];
        },

        getAlarmServiceUrl: function () {
          var alarmServiceUrl = {
            'dev': this.alarmServiceUrl.dev,
            'cfe': this.alarmServiceUrl.cfe,
            'integration': this.alarmServiceUrl.integration,
            'prod': this.alarmServiceUrl.prod
          };

          return alarmServiceUrl[this.getEnv()];
        },

        getEventServiceUrl: function () {
          var eventServiceUrl = {
            'dev': this.alarmServiceUrl.dev,
            'cfe': this.alarmServiceUrl.cfe,
            'integration': this.alarmServiceUrl.integration,
            'prod': this.alarmServiceUrl.prod
          };

          return eventServiceUrl[this.getEnv()];
        },

        getFaultServiceUrl: function () {
          var faultServiceUrl = {
            'dev': this.thresholdServiceUrl.dev,
            'cfe': this.thresholdServiceUrl.cfe,
            'integration': this.thresholdServiceUrl.integration,
            'prod': this.thresholdServiceUrl.prod
          };

          return faultServiceUrl[this.getEnv()];
        },

        getClientSecret: function () {
          var clientSecret = {
            'dev': this.oauthClientRegistration.atlas.secret,
            'cfe': this.oauthClientRegistration.cfe.secret,
            'integration': this.oauthClientRegistration.atlas.secret,
            'prod': this.oauthClientRegistration.atlas.secret
          };

          return clientSecret[this.getEnv()];
        },

        getClientId: function () {
          var clientId = {
            'dev': this.oauthClientRegistration.atlas.id,
            'cfe': this.oauthClientRegistration.cfe.id,
            'integration': this.oauthClientRegistration.atlas.id,
            'prod': this.oauthClientRegistration.atlas.id
          };

          return clientId[this.getEnv()];
        },

        getOauth2Url: function () {
          var oAuth2Url = {
            'dev': this.oauthUrl.oauth2UrlAtlas,
            'cfe': this.oauthUrl.oauth2UrlCfe,
            'integration': this.oauthUrl.oauth2UrlAtlas,
            'prod': this.oauthUrl.oauth2UrlAtlas
          };

          return oAuth2Url[this.getEnv()];
        },

        getOauthLoginUrl: function () {
          var acu = this.adminClientUrl[this.getEnv()];
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
          var acu = this.adminClientUrl[this.getEnv()];
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
          var acu = this.adminClientUrl[this.getEnv()];
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
          var healthCheckServiceUrl = {
            'dev': this.healthCheckUrl.dev,
            'cfe': this.healthCheckUrl.cfe,
            'integration': this.healthCheckUrl.integration,
            'prod': this.healthCheckUrl.prod
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
          return this.herculesUrl[this.getEnv()];
        },

        getUssUrl: function () {
          return this.ussUrl[this.getEnv()];
        },

        getCalliopeUrl: function () {
          return this.calliopeUrl[this.getEnv()];
        },

        getCertsUrl: function () {
          return this.certsUrl[this.getEnv()];
        },

        getWdmUrl: function () {
          return this.wdmUrl.dev;
        },

        getDefaultEntitlements: function () {
          return this.defaultEntitlements;
        },

        getUtilizationServiceUrl: function () {
          var utilizationServiceUrl = {
            'dev': this.utilizationServiceUrl.dev,
            'cfe': this.utilizationServiceUrl.cfe,
            'integration': this.utilizationServiceUrl.integration,
            'prod': this.utilizationServiceUrl.prod
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

        getOAuthClientRegistrationCredentials: function () {
          return Utils.Base64.encode(this.getClientId() + ':' + this.getClientSecret());
        },

        getSunlightConfigServiceUrl: function () {
          var sunlightConfigServiceUrl = {
            'dev': this.sunlightConfigServiceUrl.dev,
            'cfe': this.sunlightConfigServiceUrl.cfe,
            'integration': this.sunlightConfigServiceUrl.integration,
            'prod': this.sunlightConfigServiceUrl.prod
          };

          return sunlightConfigServiceUrl[this.getEnv()];
        }
      };

      config.setProductionBackend = function (_backend) {
        if (angular.isDefined(_backend)) {
          // Store in localStorage so new windows pick up the value
          // Will be cleared on logout
          Storage.put('backend', _backend);
          isProdBackend = isProductionBackend();
        }
      };

      function isProductionBackend() {
        return Storage.get('backend') === 'production';
      }

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
        PARTNER_SALES_ADMIN: ['partnerreports'],
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
        Help_Desk: ['helpdesk', 'helpdesk.search', 'helpdesk.user', 'helpdesk.org']
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
          'devReports',
          'cdrsupport',
          'cdr-overview'
        ],
        'squared-fusion-mgmt': [
          'cluster-details',
          'cluster-details-new',
          'management-service',
        ],
        'spark-device-mgmt': [
          'devices',
          'device-overview',
          'devices-redux'
        ],
        'squared-fusion-uc': [
          'devices',
          'device-overview',
          'devices-redux',
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
          'mediafusionconnector',
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
          'mediafusionconnector',
          'hurondetails',
          'huronsettings',
          'calendar-service',
          'call-service',
          'management-service',
          'cdrsupport',
          'cdr-overview'
        ]
      };

      // These states do not require a role/service check
      config.allowedStates = ['unauthorized', '404', 'csadmin'];

      config.ciscoOnly = ['billing'];

      return config;
    }
  ]);
