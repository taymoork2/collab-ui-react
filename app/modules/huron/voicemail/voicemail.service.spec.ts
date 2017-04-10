
describe('Service: VoicemailService', function () {

  beforeEach(function () {
    this.initModules('huron.voicemail');
    this.injectDependencies(
      'Authinfo',
      'HuronConfig',
      'HuronVoicemailService',
      'HuronUserService',
      '$httpBackend',
      '$q',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.HuronVoicemailService, 'isFeatureEnabledForAvril').and.returnValue(this.$q.resolve(false));
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('Verify update voicemail user', function () {
    let user = {
      services: ['VOICE', 'VOICEMAIL'],
      voicemail: {},
    };
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/1/users/2').respond(200, {});
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/common/customers/1/users/2', user).respond(200);
    this.HuronVoicemailService.update('2', true, ['VOICE']);
    this.$httpBackend.flush();
  });
});
