import serviceModule from './index';

describe('Service: PagingGroupSettingsService', () => {

  let successSpy;
  let failureSpy;
  const listOfPGs = getJSONFixture('huron/json/features/pagingGroup/pgListWithUUID.json');

  const emptyNumber = {
    data: [],
  };

  beforeEach(function () {
    this.initModules(serviceModule);
    this.injectDependencies(
      '$httpBackend',
      'PagingGroupSettingsService',
      'Authinfo',
      'HuronConfig',
      'Notification',
    );

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('listPagingGroupsWithNumbers', () => {
    it('should call successSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(200, listOfPGs);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/bbcd1234-abcd-abcd-abcddef123456/numbers').respond(200);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/abcd1234-abcd-abcd-abcddef123456/numbers').respond(200);
      this.PagingGroupSettingsService.listPagingGroupsWithNumberData().then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should detect 2xx but no number', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(200, listOfPGs);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/bbcd1234-abcd-abcd-abcddef123456/numbers').respond(200, emptyNumber);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/abcd1234-abcd-abcd-abcddef123456/numbers').respond(200, emptyNumber);
      this.PagingGroupSettingsService.listPagingGroupsWithNumberData().then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
      expect(this.Notification.error).toHaveBeenCalledTimes(2);
    });

    it('should detect non-2xx error', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(200, listOfPGs);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/bbcd1234-abcd-abcd-abcddef123456/numbers').respond(404);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/abcd1234-abcd-abcd-abcddef123456/numbers').respond(404);
      this.PagingGroupSettingsService.listPagingGroupsWithNumberData().then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

});
