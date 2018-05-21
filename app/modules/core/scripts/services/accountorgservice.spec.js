'use strict';

var testModule = require('./accountorgservice');

// TODO: test something meaningful
describe('Service: AccountOrgService', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'AccountOrgService',
      'UrlConfig'
    );
    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getAccount()', function () {
    beforeEach(function () {
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organization/12345/accounts').respond(200);
    });

    it('should GET /accounts', function () {
      var promise = this.AccountOrgService.getAccount('12345');
      expect(promise).toBeResolved();
    });
  });
});
