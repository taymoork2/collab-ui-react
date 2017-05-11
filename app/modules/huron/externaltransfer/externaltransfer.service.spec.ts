import externalServiceModule from './index';

describe('Service: externaltransferService', () => {
  let successSpy, failureSpy;
  beforeEach(function () {
    this.initModules(externalServiceModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'HuronConfig',
      'Authinfo',
      'ExternalTransferService',
      '$translate',
      '$httpBackend',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.$scope.$apply();
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getDefaultSettingsForUser', () => {
    it('should be successful', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(200);
      this.ExternalTransferService.getDefaultSettingForUser('123').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should not be successful', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(500);
      this.ExternalTransferService.getDefaultSettingForUser('123').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(failureSpy).toHaveBeenCalled();
      expect(successSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateSettingsForUser', () => {
    it('should be successful', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(200);
      this.ExternalTransferService.updateSettingsForUser('123', 'true').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should not be successful', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(500);
      this.ExternalTransferService.updateSettingsForUser('123', 'true').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(failureSpy).toHaveBeenCalled();
      expect(successSpy).not.toHaveBeenCalled();
    });
  });
});
