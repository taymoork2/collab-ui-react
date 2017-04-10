import testModule from './index';

describe('Me Service', () => {

  let meData = {
    userName: 'testuser@example.com',
  };

  let meResponse = { data: meData, status: 200, statusText: 'OK' };

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

      this.MeService.getMe()
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.data).toEqual(meData);
        })
        .catch(() => {
          expect('failed to get Me data from httpBackend').toBeFalsy();
        });

      this.$httpBackend.flush();
    });

  });
});
