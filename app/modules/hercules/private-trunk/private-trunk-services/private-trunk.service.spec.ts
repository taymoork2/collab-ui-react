describe('Service: PrivateTrunkService', () => {
  const privateTrunk =  getJSONFixture('hercules/private-trunk.json');

  beforeEach(function() {
    this.initModules('hercules.private-trunk-service');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'PrivateTrunkService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a private trunk', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks').respond(200, privateTrunk.privateTrunkInfo);
    this.PrivateTrunkService.getPrivateTrunk().then(response => {
      expect(response).toEqual(jasmine.objectContaining(privateTrunk.privateTrunkInfo));
    });
    this.$httpBackend.flush();
  });

  it('should set a private trunk', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks').respond(200);
    this.PrivateTrunkService.setPrivateTrunk();
    this.$httpBackend.flush();
  });

  it('should remove a private trunk', function() {
    this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks').respond(204);
    this.PrivateTrunkService.deprovisionPrivateTrunk();
    this.$httpBackend.flush();
  });

  it('should create a private trunk resource', function() {
    this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks/resources').respond(201);
    this.PrivateTrunkService.createPrivateTrunkResource(privateTrunk.resource);
    this.$httpBackend.flush();
  });

  it('should list private trunk resources', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks/resources').respond(200, privateTrunk.resourcesGET);
    this.PrivateTrunkService.listPrivateTrunkResources().then(response => {
      expect(response.resources.length).toEqual(1);
    });
    this.$httpBackend.flush();
  });

  it('should set a private trunk resource', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks/resources/1234').respond(200);
    this.PrivateTrunkService.setPrivateTrunkResource('1234');
    this.$httpBackend.flush();
  });

  it('should remove a private trunk resource', function() {
    this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/privatetrunks/resources/1234').respond(204);
    this.PrivateTrunkService.removePrivateTrunkResource('1234');
    this.$httpBackend.flush();
  });
});
