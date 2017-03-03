'use strict';

describe('Service: CloudConnectorService', function () {

  var $httpBackend, CloudConnectorService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_CloudConnectorService_, _$httpBackend_) {
    CloudConnectorService = _CloudConnectorService_;
    $httpBackend = _$httpBackend_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('myOrgId'),
      isFusionGoogleCal: sinon.stub().returns(true),
    };
    $provide.value('Authinfo', Authinfo);
  }

  describe('.getStatusCss()', function () {

    it('should just work', function () {
      expect(CloudConnectorService.getStatusCss(null)).toBe('default');
      expect(CloudConnectorService.getStatusCss({})).toBe('default');
      expect(CloudConnectorService.getStatusCss({ provisioned: false, status: 'OK' })).toBe('default');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'OK' })).toBe('success');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'ERROR' })).toBe('danger');
      expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'WARN' })).toBe('warning');
    });
  });

  describe('.updateConfig()', function () {

    var serviceId = 'squared';

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should post the service account, ACL account, and private key to the correct API', function () {
      var inputData = {
        newServiceAccountId: 'test@example.org',
        newAclAccount: 'acl@example.org',
        privateKey: 'header,actualKeyData',
        serviceId: serviceId,
      };
      var dataToBeSentToServer = {
        serviceAccountId: 'test@example.org',
        aclAdminAccount: 'acl@example.org',
        privateKeyData: 'actualKeyData',
      };
      $httpBackend.expectPOST('https://calendar-cloud-connector-integration.wbx2.com/api/v1/orgs/myOrgId/services/squared', dataToBeSentToServer).respond({});
      $httpBackend.expectPATCH('https://hercules-integration.wbx2.com/v1/organizations/myOrgId/services/squared').respond({});
      CloudConnectorService.updateConfig(inputData.newServiceAccountId, inputData.newAclAccount, inputData.privateKey, inputData.serviceId);
      $httpBackend.flush();
    });

    it('should post an empty ACL account if an empty string is provided, because doing so is supposed to clear it server-side', function () {
      var inputData = {
        newServiceAccountId: 'test@example.org',
        newAclAccount: '',
        privateKey: 'header,actualKeyData',
        serviceId: serviceId,
      };
      var dataToBeSentToServer = {
        serviceAccountId: 'test@example.org',
        aclAdminAccount: '',
        privateKeyData: 'actualKeyData',
      };
      $httpBackend.expectPOST('https://calendar-cloud-connector-integration.wbx2.com/api/v1/orgs/myOrgId/services/squared', dataToBeSentToServer).respond({});
      $httpBackend.expectPATCH('https://hercules-integration.wbx2.com/v1/organizations/myOrgId/services/squared').respond({});
      CloudConnectorService.updateConfig(inputData.newServiceAccountId, inputData.newAclAccount, inputData.privateKey, inputData.serviceId);
      $httpBackend.flush();
    });

  });
});
