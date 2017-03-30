(function () {
  'use strict';

  var serviceUrlMapping = {
    AdminServiceUrl: {
      dev: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      cfe: 'https://atlas-e.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    },
    LocusServiceUrl: {
      dev: 'https://admin-portal-test-public.wbx2.com/locus',
      cfe: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      prod: 'https://admin-portal-test-public.wbx2.com/locus',
    },
    FeatureToggleUrl: {
      dev: 'https://locus-a.wbx2.com',
      cfe: 'https://locus-e.wbx2.com',
      integration: 'https://locus-a.wbx2.com',
      prod: 'https://locus-a.wbx2.com',
    },
    AthenaServiceUrl: {
      dev: 'https://athena-integration.wbx2.com/athena/api/v1',
      cfe: 'https://athena-e.wbx2.com/athena/api/v1',
      integration: 'https://athena-integration.wbx2.com/athena/api/v1',
      prod: 'https://athena-a.wbx2.com/athena/api/v1',
    },
    CsdmServiceUrl: {
      dev: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      cfe: 'https://csdm-e.wbx2.com/csdm/api/v1',
      integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      prod: 'https://csdm-a.wbx2.com/csdm/api/v1',
    },
    MessengerServiceUrl: {
      dev: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      cfe: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      integration: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      prod: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1',
    },
    UtilizationServiceUrl: {
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
    },
    ScimUrl: {
      dev: 'https://identity.webex.com/identity/scim/%s/v1/Users',
      cfe: 'https://identitybts.webex.com/identity/scim/%s/v1/Users',
      integration: 'https://identity.webex.com/identity/scim/%s/v1/Users',
      prod: 'https://identity.webex.com/identity/scim/%s/v1/Users',
    },
    UserReportsUrl: {
      dev: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
      cfe: 'https://identitybts.webex.com/identity/config/%s/v1/UserReports',
      integration: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
      prod: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
    },
    ScomUrl: {
      dev: 'https://identity.webex.com/organization/scim/v1/Orgs',
      cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs',
      integration: 'https://identity.webex.com/organization/scim/v1/Orgs',
      prod: 'https://identity.webex.com/organization/scim/v1/Orgs',
    },
    DomainManagementUrl: {
      dev: 'https://identity.webex.com/organization/%s/v1/',
      cfe: 'https://identitybts.webex.com/organization/%s/v1/',
      integration: 'https://identity.webex.com/organization/%s/v1/',
      prod: 'https://identity.webex.com/organization/%s/v1/',
    },
    SparkDomainManagementUrl: {
      dev: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      cfe: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      integration: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    },
    SparkDomainCheckUrl: {
      dev: '.wbx2.com',
      cfe: '.wbx2.com',
      integration: '.wbx2.com',
      prod: '.ciscospark.com',
    },
    HealthCheckServiceUrl: {
      dev: 'https://ciscospark.statuspage.io/index.json',
      cfe: 'https://ciscospark.statuspage.io/index.json',
      integration: 'https://ciscospark.statuspage.io/index.json',
      prod: 'https://ciscospark.statuspage.io/index.json',
    },
    HerculesUrl: {
      dev: 'https://hercules-integration.wbx2.com/v1',
      cfe: 'https://hercules-e.wbx2.com/v1',
      integration: 'https://hercules-integration.wbx2.com/v1',
      prod: 'https://hercules-a.wbx2.com/v1',
    },
    HerculesUrlV2: {
      dev: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      cfe: 'https://hercules-e.wbx2.com/hercules/api/v2',
      integration: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      prod: 'https://hercules-a.wbx2.com/hercules/api/v2',
    },
    FlagServiceUrl: {
      dev: 'https://hercules-integration.wbx2.com/fls/api/v1',
      cfe: 'https://hercules-e.wbx2.com/fls/api/v1',
      integration: 'https://hercules-integration.wbx2.com/fls/api/v1',
      prod: 'https://hercules-a.wbx2.com/fls/api/v1',
    },
    UssUrl: {
      dev: 'https://uss-integration.wbx2.com/',
      cfe: 'https://uss-e.wbx2.com/',
      integration: 'https://uss-integration.wbx2.com/',
      prod: 'https://uss-a.wbx2.com/',
    },
    CertsUrl: {
      dev: 'https://certs-integration.wbx2.com/',
      cfe: 'https://certs-e.wbx2.com/',
      integration: 'https://certs-integration.wbx2.com/',
      prod: 'https://certs-a.wbx2.com/',
    },
    FeatureUrl: {
      dev: 'https://feature-a.wbx2.com/feature/api/v1',
      cfe: 'http://feature.cfe.wbx2.com/feature/api/v1',
      integration: 'https://feature-a.wbx2.com/feature/api/v1',
      prod: 'https://feature-a.wbx2.com/feature/api/v1',
    },
    SunlightConfigServiceUrl: {
      dev: 'https://config.devus1.ciscoccservice.com/config/v1',
      cfe: 'https://config.appstaging.ciscoccservice.com/config/v1',
      integration: 'https://config.appstaging.ciscoccservice.com/config/v1',
      prod: 'https://config.produs1.ciscoccservice.com/config/v1',
    },
    SunlightBubbleUrl: {
      dev: 'https://bubble.devus1.ciscoccservice.com',
      cfe: 'https://bubble.appstaging.ciscoccservice.com',
      integration: 'https://bubble.appstaging.ciscoccservice.com',
      prod: 'https://bubble.produs1.ciscoccservice.com',
    },
    SunlightReportServiceUrl: {
      dev: 'https://reporting.devus1.ciscoccservice.com/reporting/v1',
      cfe: 'https://reporting.appstaging.ciscoccservice.com/reporting/v1',
      integration: 'https://reporting.appstaging.ciscoccservice.com/reporting/v1',
      prod: 'https://reporting.produs1.ciscoccservice.com/reporting/v1',
    },
    CcfsUrl: {
      dev: 'https://ccfs.produs1.ciscoccservice.com/v1/authorize?delegation=true&appType=sunlightdev&callbackUrl=',
      cfe: 'https://ccfs.produs1.ciscoccservice.com/v1/authorize?delegation=true&appType=sunlightstaging&callbackUrl=',
      integration: 'https://ccfs.produs1.ciscoccservice.com/v1/authorize?delegation=true&appType=sunlightstaging&callbackUrl=',
      prod: 'https://ccfs.produs1.ciscoccservice.com/v1/authorize?delegation=true&appType=sunlight&callbackUrl=',
    },
    CalliopeUrl: {
      dev: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      cfe: 'https://calliope-e.wbx2.com/calliope/api/authorization/v1',
      integration: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1',
    },
    CdrUrl: {
      dev: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      cfe: 'https://hades.huron-dev.com/api/v1/elasticsearch/',
      integration: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      prod: 'https://hades.huron-dev.com/api/v1/elasticsearch/',
    },
    BmmpUrl: {
      dev: 'https://bmmp.dmz.ciscospark.com/api/v1',
      cfe: 'https://bmmp.ciscospark.com/api/v1',
      integration: 'https://bmmp.dmz.ciscospark.com/api/v1',
      prod: 'https://bmmp.ciscospark.com/api/v1',
    },
    GeminiUrl: {
      dev: 'https://hfccap12.qa.webex.com/ccaportal/api/v2/',
      cfe: 'https://hfccap12.qa.webex.com/ccaportal/api/v2/',
      integration: 'https://ccaportalbts.webex.com/ccaportal/api/v2/',
      prod: 'https://ccaportal.webex.com/ccaportal/api/v2/',
    },
    GssUrl: {
      dev: 'https://statusbts.webex.com/status',
      cfe: 'https://statusbts.webex.com/status',
      integration: 'https://statusbts.webex.com/status',
      prod: 'https://healthstatus.webex.com/status',
    },
    UccUrl: {
      dev: 'https://ucc-integration.wbx2.com/ucm-service/api/v1',
      cfe: 'https://ucc-e.wbx2.com/ucm-service/api/v1',
      integration: 'https://ucc-integration.wbx2.com/ucm-service/api/v1',
      prod: 'https://ucc-a.wbx2.com/ucm-service/api/v1',
    },
    HybridVoicemailUrl: {
      dev: 'https://ucc-integration.wbx2.com/voicemail/api/v1',
      cfe: 'https://ucc-e.wbx2.com/voicemail/api/v1',
      integration: 'https://ucc-integration.wbx2.com/voicemail/api/v1',
      prod: 'https://ucc-a.wbx2.com/voicemail/api/v1',
    },
    CccUrl: {
      dev: 'https://calendar-cloud-connector-integration.wbx2.com/api/v1',
      cfe: 'https://calendar-cloud-connector-integration.wbx2.com/api/v1',
      integration: 'https://calendar-cloud-connector-integration.wbx2.com/api/v1',
      prod: 'https://calendar-cloud-connector-a.wbx2.com/api/v1',
    },
    ContextDiscoveryServiceUrl: {
      dev: 'https://discovery.appstaging.ciscoccservice.com/discovery/apps/v1',
      cfe: 'https://discovery.appstaging.ciscoccservice.com/discovery/apps/v1',
      integration: 'https://discovery.appstaging.ciscoccservice.com/discovery/apps/v1',
      prod: 'https://discovery.produs1.ciscoccservice.com/discovery/apps/v1',
    },
    HybridEncryptionServiceUrl: {
      dev: 'https://encryption-integration.wbx2.com/encryption/api/v1',
      cfe: 'https://encryption-integration.wbx2.com/encryption/api/v1',
      integration: 'https://encryption-integration.wbx2.com/encryption/api/v1',
      prod: 'https://encryption-a.wbx2.com/encryption/api/v1',
    },
    L2sipUrl: {
      dev: 'https://l2sip-cfa-web.wbx2.com/l2sip/api/v1',
      cfe: 'https://l2sip-integration-web.wbx2.com/l2sip/api/v1',
      integration: 'https://l2sip-cfa-web.wbx2.com/l2sip/api/v1', // Tool is not working in integration, we need to point to prod for now.
      prod: 'https://l2sip-cfa-web.wbx2.com/l2sip/api/v1',
    },
    ArgonautReportUrl: {
      dev: 'https://argonaut-integration.wbx2.com/argonaut/api/v1/compliance/report',
      cfe: 'https://argonaut-e.wbx2.com/argonaut/api/v1/compliance/report',
      integration: 'https://argonaut-integration.wbx2.com/argonaut/api/v1/compliance/report',
      prod: 'https://argonaut-a.wbx2.com/argonaut/api/v1/compliance/report',
    },
    LyraServiceUrl: {
      dev: 'https://lyra-integration.wbx2.com/lyra/api/v1',
      cfe: 'https://lyra-e.wbx2.com/lyra/api/v1',
      integration: 'https://lyra-integration.wbx2.com/lyra/api/v1',
      prod: 'https://lyra-a.wbx2.com/lyra/api/v1',
    },

    // urls same for all environments

    ProdAdminServiceUrl: 'https://atlas-a.wbx2.com/admin/api/v1/',
    WebexAdvancedEditUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    WebexAdvancedHomeUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    WebexMaxConcurrentMeetings: 'https://%s/meetingsapi/v1/report/MonthlyMaxConcurrentMeetings',
    WebexConcurrentMeetings: 'https://%s/meetingsapi/v1/report/ConcurrentMeetingsDetailByMonth',
    WebClientUrl: 'https://web.ciscospark.com/',
    AndroidStoreUrl: 'http://cs.co/sqandroid',
    ItunesStoreUrl: 'http://cs.co/sqios',
    SquaredAppUrl: 'squared://',
    StatusPageUrl: 'http://status.ciscospark.com/',
    CallflowServiceUrl: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
    LogMetricsUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
    SSOTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
    SSOSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',
    WebexMetricsUrl: 'https://ds2-qlikdemo.cisco.com/single/?appid=28697d05-07e5-4d57-b217-302b036568c2&sheet=wWJuDnE',
  };

  module.exports = angular
    .module('core.urlconfig', [
      require('modules/core/config/config'),
      require('modules/core/scripts/services/utils'),
    ])
    .factory('UrlConfig', UrlConfig)
    .name;

  function UrlConfig(Config, Utils) {
    return _.reduce(serviceUrlMapping, function (service, urlMapping, key) {
      service['get' + key] = function () {
        var env = Config.getEnv();
        var args = _.toArray(arguments);
        var resolvedUrl = _.isString(urlMapping) ? urlMapping : urlMapping[env];
        return Utils.sprintf(resolvedUrl, args);
      };
      return service;
    }, {});
  }

}());
