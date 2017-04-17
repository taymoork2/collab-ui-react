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

  describe('getDefaultSettings', () => {
    it('should be successful', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(200);
      this.ExternalTransferService.getDefaultSetting('123', 'users').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should not be successful', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/123').respond(500);
      this.ExternalTransferService.getDefaultSetting('123', 'places').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(failureSpy).toHaveBeenCalled();
      expect(successSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should be successful', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/123').respond(200);
      this.ExternalTransferService.updateSettings('123', 'users', 'true').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should not be successful', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/123').respond(500);
      this.ExternalTransferService.updateSettings('123', 'places', 'true').then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(failureSpy).toHaveBeenCalled();
      expect(successSpy).not.toHaveBeenCalled();
    });
  });
});
