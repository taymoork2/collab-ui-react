describe('Service: PagingGroupService', () => {

  let successSpy;
  let failureSpy;
  const pg = getJSONFixture('huron/json/features/pagingGroup/pg.json');
  const listOfPGs = getJSONFixture('huron/json/features/pagingGroup/pgListWithUUID.json');

  const emptyNumber = {
    data: [],
  };

  beforeEach(function () {
    this.initModules('huron.paging-group');
    this.injectDependencies(
      '$httpBackend',
      'PagingGroupService',
      'Authinfo',
      'Notification',
      'HuronConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');

    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getListOfPagingGroups: ', () => {
    it('should call successSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(200, listOfPGs);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/bbcd1234-abcd-abcd-abcddef123456/numbers').respond(200);
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/abcd1234-abcd-abcd-abcddef123456/numbers').respond(200);
      this.PagingGroupService.getListOfPagingGroups().then(
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
      this.PagingGroupService.getListOfPagingGroups().then(
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
      this.PagingGroupService.getListOfPagingGroups().then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(2);
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(500);
      this.PagingGroupService.getListOfPagingGroups().then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('getPagingGroup: ', () => {
    it('should call successSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(200);
      this.PagingGroupService.getPagingGroup(pg.groupId).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(500);
      this.PagingGroupService.getPagingGroup(pg.groupId).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('savePagingGroup: ', () => {
    it('should success', function () {
      this.$httpBackend.expectPOST(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(200);
      this.PagingGroupService.savePagingGroup(pg).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectPOST(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups').respond(500);
      this.PagingGroupService.savePagingGroup(pg).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updatePagingGroup: ', () => {

    it('should success', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(200);
      this.PagingGroupService.updatePagingGroup(pg).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(500);
      this.PagingGroupService.updatePagingGroup(pg).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('deletePagingGroup: ', () => {
    it('should success', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(200);
      this.PagingGroupService.deletePagingGroup(pg.groupId).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getPgUrl() + '/customers/' + this.Authinfo.getOrgId() + '/pagingGroups/' + pg.groupId).respond(500);
      this.PagingGroupService.deletePagingGroup(pg.groupId).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
