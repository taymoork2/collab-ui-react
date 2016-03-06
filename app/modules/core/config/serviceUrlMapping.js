(function () {
  'use strict';

  var serviceUrlMapping = {
    adminPortalUrl: {
      dev: 'http://127.0.0.1:8000',
      cfe: 'https://cfe-admin.ciscospark.com',
      integration: 'https://int-admin.ciscospark.com/',
      prod: 'https://admin.ciscospark.com/'
    },
    adminServiceUrl: {
      dev: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-e.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
    },
    locusServiceUrl: {
      dev: 'https://admin-portal-test-public.wbx2.com/locus',
      cfe: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      prod: 'https://admin-portal-test-public.wbx2.com/locus'
    },
    featureToggleUrl: {
      dev: 'https://locus-a.wbx2.com',
      cfe: 'https://locus-e.wbx2.com',
      integration: 'https://locus-a.wbx2.com',
      prod: 'https://locus-a.wbx2.com'
    },
    enrollmentServiceUrl: {
      dev: 'https://locus-integration.wbx2.com/locus/api/v1',
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
    eventServiceUrl: {
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
    faultServiceUrl: {
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
      dev: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      cfe: 'https://csdm-e.wbx2.com/csdm/api/v1',
      integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      prod: 'https://csdm-a.wbx2.com/csdm/api/v1'
    },
    messengerServiceUrl: {
      dev: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      cfe: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      integration: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      prod: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1'
    },
    utilizationServiceUrl: {
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    },
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
    domainManagementUrl: {
      dev: 'https://identity.webex.com/organization/%s/v1/',
      cfe: 'https://identitybts.webex.com/organization/%s/v1/',
      integration: 'https://identity.webex.com/organization/%s/v1/',
      prod: 'https://identity.webex.com/organization/%s/v1/'
    },
    sparkDomainManagementUrl: {
      dev: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
    },
    sparkDomainCheckUrl: {
      dev: '.wbx2.com',
      cfe: '.wbx2.com',
      integration: '.wbx2.com',
      prod: '.ciscospark.com'
    },
    healthCheckServiceUrl: {
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
    herculesUrlV2: {
      dev: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      cfe: 'https://hercules-e.wbx2.com/hercules/api/v2',
      integration: 'https://hercules-integration.wbx2.com/hercules/api/v2',
      prod: 'https://hercules-a.wbx2.com/hercules/api/v2'
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
    wdmUrl: {
      dev: 'https://wdm-a.wbx2.com/wdm/api/v1',
      cfe: 'http://wdm.cfe.wbx2.com/wdm/api/v1',
      integration: 'https://wdm-a.wbx2.com/wdm/api/v1',
      prod: 'https://wdm-a.wbx2.com/wdm/api/v1',
    },
    sunlightConfigServiceUrl: {
      dev: 'https://config.rciad.ciscoccservice.com/config/v1',
      cfe: 'https://config.rciad.ciscoccservice.com/config/v1',
      integration: 'https://config.rciad.ciscoccservice.com/config/v1',
      prod: 'https://config.rciad.ciscoccservice.com/config/v1' //This will change to prod later in future
    },
    calliopeUrl: {
      dev: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      cfe: 'https://calliope-e.wbx2.com/calliope/api/authorization/v1',
      integration: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1'
    },
    cdrUrl: {
      dev: 'https://hades.huron-int.com/api/v1/elasticsearch/_all/_search?pretty',
      cfe: 'https://hades.huron-dev.com/api/v1/elasticsearch/_all/_search?pretty',
      integration: 'https://hades.huron-int.com/api/v1/elasticsearch/_all/_search?pretty',
      prod: 'https://hades.huron-dev.com/api/v1/elasticsearch/_all/_search?pretty'
    }
  };

  angular
    .module('Core')
    .value('serviceUrlMapping', serviceUrlMapping);

}());
