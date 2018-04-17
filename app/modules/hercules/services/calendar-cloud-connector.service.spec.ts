import moduleName, { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

describe('CloudConnectorService', () => {

  let $httpBackend, CloudConnectorService: CloudConnectorService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(angular.mock.module(mockDependencies));

  beforeEach(inject((_CloudConnectorService_, _$httpBackend_) => {
    CloudConnectorService = _CloudConnectorService_;
    $httpBackend = _$httpBackend_;
  }));

  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authinfo.getOrgId').and.returnValue('myOrgId'),
      isFusionGoogleCal: jasmine.createSpy('Authinfo.isFusionGoogleCal').and.returnValue(true),
    };
    $provide.value('Authinfo', Authinfo);
  }

  describe('.updateConfig()', function () {

    afterEach(() => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    afterAll(() => {
      $httpBackend = undefined;
    });

    it('should post the service account, ACL account, and private key to the correct API', () => {
      const inputData = {
        apiClientId: '123',
        testEmailAccount: 'test@example.org',
        aclAdminAccount: 'acl@example.org',
      };
      const dataToBeSentToServer = {
        apiClientId: '123',
        testEmailAccount: 'test@example.org',
        aclAdminAccount: 'acl@example.org',
      };
      $httpBackend.expectPOST('https://calendar-cloud-connector-intb.ciscospark.com/api/v1/orgs/myOrgId/services/squared-fusion-gcal', dataToBeSentToServer).respond({});
      $httpBackend.expectPATCH('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/myOrgId/services/squared-fusion-gcal').respond({});
      CloudConnectorService.updateConfig(inputData);
      $httpBackend.flush();
    });

    it('should reuse the aclAdminAccount as testEmailAccount if missing', () => {
      const inputData = {
        apiClientId: '123',
        aclAdminAccount: 'acl@example.org',
      };
      const dataToBeSentToServer = {
        apiClientId: '123',
        testEmailAccount: inputData.aclAdminAccount,
        aclAdminAccount: 'acl@example.org',
      };
      $httpBackend.expectPOST('https://calendar-cloud-connector-intb.ciscospark.com/api/v1/orgs/myOrgId/services/squared-fusion-gcal', dataToBeSentToServer).respond({});
      $httpBackend.expectPATCH('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/myOrgId/services/squared-fusion-gcal').respond({});
      CloudConnectorService.updateConfig(inputData);
      $httpBackend.flush();
    });

  });

  describe('help desk support', () => {

    it('should use the provided orgId when looking up data in CCC', () => {
      const customerOrgId = 'Kål';
      CloudConnectorService.getService('squared-fusion-gcal', customerOrgId);
      $httpBackend.expectGET(`https://calendar-cloud-connector-intb.ciscospark.com/api/v1/orgs/${customerOrgId}/services/squared-fusion-gcal`).respond({});
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe(' error handling ', () => {

    it('should map a valid error code to a translation key', () => {
      const errorCode = 11;
      const returnedTranslationKey = CloudConnectorService.getProvisioningResultTranslationKey(errorCode);
      expect(returnedTranslationKey).toBe('hercules.settings.googleCalendar.provisioningResults.INVALID_SESSION_ID');
    });

    it('should default to the general error if the error code is not in the enum', () => {
      const errorCode = 1913;
      const returnedTranslationKey = CloudConnectorService.getProvisioningResultTranslationKey(errorCode);
      expect(returnedTranslationKey).toBe('hercules.settings.googleCalendar.provisioningResults.GENERAL_ERROR');
    });

  });

});
