describe('Service: SpeedDialService', () => {
  beforeEach(function() {
    this.initModules('huron.speed-dial');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      '$q',
      'SpeedDialService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    let getSpeedDialResponseEmpty = {
      speedDials: [],
    };

    this.getSpeedDialResponseEmpty = getSpeedDialResponseEmpty;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('getSpeedDial', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/speeddials')
      .respond(200, this.getSpeedDialResponseEmpty);
    this.SpeedDialService.getSpeedDials('places', '100000').then(function(data) {
      expect(data.speedDials.length).toBe(0);
    });
    this.$httpBackend.flush();
  });

  it('updateSpeedDial', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/places/100000/features/bulk/speeddials')
      .respond(200, { response: true });
    this.SpeedDialService.updateSpeedDials('places', '100000', []).then(function(data) {
      expect(data.response).toBe(true);
    });
    this.$httpBackend.flush();
  });

  it('getUserName', function () {
    let successSpy = jasmine.createSpy('success');
    let failureSpy = jasmine.createSpy('failure');
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/common/customers/' + this.Authinfo.getOrgId() + '/users/1').respond(200);
    this.SpeedDialService.getUserName(1).then(
      successSpy,
      failureSpy,
    );
    this.$httpBackend.flush();
    expect(successSpy).toHaveBeenCalled();
    expect(failureSpy).not.toHaveBeenCalled();
  });
});
