import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

describe('CloudConnectorService', () => {

  let $httpBackend, CloudConnectorService: CloudConnectorService;

  beforeEach(angular.mock.module('Hercules'));
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

  // describe('.getStatusCss()', () => {

  //   it('should just work', () => {
  //     expect(CloudConnectorService.getStatusCss(null)).toBe('default');
  //     expect(CloudConnectorService.getStatusCss({})).toBe('default');
  //     expect(CloudConnectorService.getStatusCss({ provisioned: false, status: 'OK' })).toBe('default');
  //     expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'OK' })).toBe('success');
  //     expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'ERROR' })).toBe('danger');
  //     expect(CloudConnectorService.getStatusCss({ provisioned: true, status: 'WARN' })).toBe('warning');
  //   });
  // });

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
      CloudConnectorService.updateConfig({
        apiClientId: inputData.apiClientId,
        aclAdminAccount: inputData.aclAdminAccount,
        testEmailAccount: inputData.testEmailAccount,
      });
      $httpBackend.flush();
    });

    // it('should post an empty ACL account if an empty string is provided, because doing so is supposed to clear it server-side', () => {
    //   let inputData = {
    //     newServiceAccountId: 'test@example.org',
    //     newAclAccount: '',
    //     privateKey: 'header,actualKeyData',
    //     serviceId: serviceId,
    //   };
    //   let dataToBeSentToServer = {
    //     serviceAccountId: 'test@example.org',
    //     aclAdminAccount: '',
    //     privateKeyData: 'actualKeyData',
    //   };
    //   $httpBackend.expectPOST('https://calendar-cloud-connector-intb.ciscospark.com/api/v1/orgs/myOrgId/services/squared', dataToBeSentToServer).respond({});
    //   $httpBackend.expectPATCH('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/myOrgId/services/squared').respond({});
    //   CloudConnectorService.updateConfig(inputData.newServiceAccountId, inputData.newAclAccount, inputData.privateKey, inputData.serviceId);
    //   $httpBackend.flush();
    // });

  });

  describe(' error handling ', () => {

    it('should map a valid error code to a translation key', () => {
      const errorCode = 1;
      const returnedTranslationKey = CloudConnectorService.getProvisioningResultTranslationKey(errorCode);
      expect(returnedTranslationKey).toBe('hercules.settings.googleCalendar.provisioningResults.INVALID_API_ACCESS_KEY');
    });

    it('should default to the general error if the error code is not in the enum', () => {
      const errorCode = 1913;
      const returnedTranslationKey = CloudConnectorService.getProvisioningResultTranslationKey(errorCode);
      expect(returnedTranslationKey).toBe('hercules.settings.googleCalendar.provisioningResults.GENERAL_ERROR');
    });

  });

});
