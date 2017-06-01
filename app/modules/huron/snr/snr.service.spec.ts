describe('Service: SnrService', () => {
  beforeEach(function() {
    this.initModules('huron.snr');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      '$q',
      'SnrService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    let getSnrEmpty = [];

    this.getSnrEmpty = getSnrEmpty;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should return empty Single Number Reach on getSnr', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/111/remotedestinations')
      .respond(200, this.getSnrEmpty);
    this.SnrService.getSnrList('111').then(function(data) {
      expect(data.length).toBe(0);
    });
    this.$httpBackend.flush();
  });

  it('should update Single Number Reach on updateSnr', function() {

    this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/111/remotedestinations/' + '111')
      .respond(200, { response: true });
    this.SnrService.updateSnr('111', '111', [ { destination: '123' } ]).then(function(data) {
      expect(data.response).toBe(true);
    });
    this.$httpBackend.flush();
  });

  it('saveSnr', function() {
    this.$httpBackend.expectPOST(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/111/remotedestinations')
      .respond(200, { response: true });
    this.SnrService.saveSnr('111', '', [ { } ]).then(function(data) {
      expect(data.response).toBe(true);
    });
    this.$httpBackend.flush();
  });

  it('deleteSnr', function() {
    this.$httpBackend.expectDELETE(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/111/remotedestinations/' + '111')
      .respond(200, { response: true });
    this.SnrService.deleteSnr('111', '111').then(function(data) {
      expect(data.response).toBe(true);
    });
    this.$httpBackend.flush();
  });
});
