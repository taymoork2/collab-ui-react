describe('Service: FeatureService', () => {

  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList.json');

  let successResponse = {
    id: '0001',
    photos: [
      {
        type: 'photo',
        value: 'https://12345/abcbe',
      },
      {
        type: 'thumbnail',
        value: 'https://09876/zyxwuv',
      }],
  };

  beforeEach(function () {
    this.initModules('huron.feature-member-service');
    this.injectDependencies(
      '$httpBackend',
      '$http',
      '$q',
      'FeatureMemberService',
      'Authinfo',
      'UrlConfig',
      'MemberService'
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.getMemberListDefer = this.$q.defer();
    spyOn(this.MemberService, 'getMemberList').and.returnValue(this.getMemberListDefer.promise);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a suggested member', function () {
    this.getMemberListDefer.resolve(membersList);
    this.FeatureMemberService.getMemberSuggestions('por').then(function (response) {
      expect(response).toEqual(jasmine.objectContaining(membersList));
    });
  });

  it('should get the picture of a member', function () {
    let fakeUserId = 'fake-userid';
    let expectedUrl = 'https://identity.webex.com/identity/scim/12345/v1/Users/fake-userid';
    this.$httpBackend.whenGET(expectedUrl).respond(200, successResponse);
    this.FeatureMemberService.getMemberPicture(fakeUserId).then(function (response) {
      expect(response).toEqual('https://09876/zyxwuv');
    });
    this.$httpBackend.flush();
  });

});
