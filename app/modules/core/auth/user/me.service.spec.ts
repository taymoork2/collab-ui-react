import testModule from './index';

describe('Me Service', () => {

  const meData = {
    userName: 'testuser@example.com',
  };

  const meResponse = { data: meData, status: 200, statusText: 'OK' };

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'MeService',
    );
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getMe()', () => {

    it('should return a promise that resolves to "me" user data', function () {
      this.$httpBackend.expectGET(/.*\/Users\/me\b.*/).respond(200, meResponse);

      let resp;
      this.MeService.getMe().then(response => {
        resp = response;
      });
      this.$httpBackend.flush();
      expect(resp.status).toEqual(200);
      expect(resp.data).toEqual(meData);
    });
  });
});
