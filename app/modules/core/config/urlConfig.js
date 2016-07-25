(function () {
  'use strict';

  var serviceUrlMapping = {
    AdminServiceUrl: {
      dev: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-e.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
    },
    LocusServiceUrl: {
      dev: 'https://admin-portal-test-public.wbx2.com/locus',
      cfe: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      prod: 'https://admin-portal-test-public.wbx2.com/locus'
    },
    FeatureToggleUrl: {
      dev: 'https://locus-a.wbx2.com',
      cfe: 'https://locus-e.wbx2.com',
      integration: 'https://locus-a.wbx2.com',
      prod: 'https://locus-a.wbx2.com'
    },
    EnrollmentServiceUrl: {
      dev: 'https://locus-integration.wbx2.com/locus/api/v1',
      cfe: 'https://locus-e.wbx2.com/locus/api/v1',
      integration: 'https://locus-integration.wbx2.com/locus/api/v1',
      prod: 'https://locus-a.wbx2.com/locus/api/v1'
    },
    AthenaServiceUrl: {
      dev: 'https://athena-integration.wbx2.com/athena/api/v1',
      cfe: 'https://athena-e.wbx2.com/athena/api/v1',
      integration: 'https://athena-integration.wbx2.com/athena/api/v1',
      prod: 'https://athena-a.wbx2.com/athena/api/v1'
    },
    CsdmServiceUrl: {
      dev: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      cfe: 'https://csdm-e.wbx2.com/csdm/api/v1',
      integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      prod: 'https://csdm-a.wbx2.com/csdm/api/v1'
    },
    MessengerServiceUrl: {
      dev: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      cfe: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      integration: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      prod: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1'
    },
    UtilizationServiceUrl: {
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    },
    ScimUrl: {
      dev: 'https://identity.webex.com/identity/scim/%s/v1/Users',
      cfe: 'https://identitybts.webex.com/identity/scim/%s/v1/Users',
      integration: 'https://identity.webex.com/identity/scim/%s/v1/Users',
      prod: 'https://identity.webex.com/identity/scim/%s/v1/Users'
    },
    UserReportsUrl: {
      dev: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
      cfe: 'https://identitybts.webex.com/identity/config/%s/v1/UserReports',
      integration: 'https://identity.webex.com/identity/config/%s/v1/UserReports',
      prod: 'https://identity.webex.com/identity/config/%s/v1/UserReports'
    },
    ScomUrl: {
      dev: 'https://identity.webex.com/organization/scim/v1/Orgs',
      cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs',
      integration: 'https://identity.webex.com/organization/scim/v1/Orgs',
      prod: 'https://identity.webex.com/organization/scim/v1/Orgs'
    },
    DomainManagementUrl: {
      dev: 'https://identity.webex.com/organization/%s/v1/',
      cfe: 'https://identitybts.webex.com/organization/%s/v1/',
      integration: 'https://identity.webex.com/organization/%s/v1/',
      prod: 'https://identity.webex.com/organization/%s/v1/'
    },
    SparkDomainManagementUrl: {
      dev: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
    },
    SparkDomainCheckUrl: {
      dev: '.wbx2.com',
      cfe: '.wbx2.com',
      integration: '.wbx2.com',
      prod: '.ciscospark.com'
    },
    HealthCheckServiceUrl: {
      dev: 'https://ciscospark.statuspage.io/index.json',
      cfe: 'https://ciscospark.statuspage.io/index.json',
      integration: 'https://ciscospark.statuspage.io/index.json',
      prod: 'https://ciscospark.statuspage.io/index.json'
    },
    HerculesUrl: {
      dev: 'https://hercules-integration.wbx2.com/v1',
      cfe: 'https://hercules-e.wbx2.com/v1',
      integration: 'https://hercules-integration.wbx2.com/v1',
      prod: 'https://hercules-a.wbx2.com/v1'
    },
    HerculesUrlV2: {
      dev: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      cfe: 'https://hercules-e.wbx2.com/hercules/api/v2',
      integration: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      prod: 'https://hercules-a.wbx2.com/hercules/api/v2'
    },
    UssUrl: {
      dev: 'https://uss-integration.wbx2.com/',
      cfe: 'https://uss-e.wbx2.com/',
      integration: 'https://uss-integration.wbx2.com/',
      prod: 'https://uss-a.wbx2.com/'
    },
    CertsUrl: {
      dev: 'https://certs-integration.wbx2.com/',
      cfe: 'https://certs-e.wbx2.com/',
      integration: 'https://certs-integration.wbx2.com/',
      prod: 'https://certs-a.wbx2.com/'
    },
    WdmUrl: {
      dev: 'https://wdm-a.wbx2.com/wdm/api/v1',
      cfe: 'http://wdm.cfe.wbx2.com/wdm/api/v1',
      integration: 'https://wdm-a.wbx2.com/wdm/api/v1',
      prod: 'https://wdm-a.wbx2.com/wdm/api/v1',
    },
    SunlightConfigServiceUrl: {
      dev: 'https://config.dev.ciscoccservice.com/config/v1',
      cfe: 'https://config.appstaging.ciscoccservice.com/config/v1',
      integration: 'https://config.appstaging.ciscoccservice.com/config/v1',
      prod: 'https://config.rciad.ciscoccservice.com/config/v1'
    },
    SunlightBubbleUrl: {
      dev: 'https://bubble.dev.ciscoccservice.com',
      cfe: 'https://bubble.appstaging.ciscoccservice.com',
      integration: 'https://bubble.appstaging.ciscoccservice.com',
      prod: 'https://bubble.rciad.ciscoccservice.com'
    },
    CalliopeUrl: {
      dev: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      cfe: 'https://calliope-e.wbx2.com/calliope/api/authorization/v1',
      integration: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1'
    },
    CdrUrl: {
      dev: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      cfe: 'https://hades.huron-dev.com/api/v1/elasticsearch/',
      integration: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      prod: 'https://hades.huron-dev.com/api/v1/elasticsearch/'
    },

    // urls same for all environments

    ProdAdminServiceUrl: 'https://atlas-a.wbx2.com/admin/api/v1/',
    WebexAdvancedEditUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    WebexAdvancedHomeUrl: 'https://%s/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    WebClientUrl: 'https://web.ciscospark.com/',
    AndroidStoreUrl: 'http://cs.co/sqandroid',
    ItunesStoreUrl: 'http://cs.co/sqios',
    SquaredAppUrl: 'squared://',
    StatusPageUrl: 'http://status.ciscospark.com/',
    CallflowServiceUrl: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
    LogMetricsUrl: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
    SSOTestUrl: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
    SSOSetupUrl: 'https://idbroker.webex.com/idb/idbconfig/',

  };

  angular
    .module('Core')
    .factory('UrlConfig', UrlConfig);

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
