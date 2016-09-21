import digitalRiverModule from './index';

describe('Service: DigitalRiverService', () => {
  beforeEach(function () {
    this.initModules(digitalRiverModule);
    this.injectDependencies(
      '$document',
      '$httpBackend',
      'DigitalRiverService',
      'UrlConfig'
    );
    spyOn(this.$document, 'prop');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get digital river order history url', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, 'abc+123');
    this.DigitalRiverService.getOrderHistoryUrl().then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith('cookie', 'webexToken=abc+123;domain=ciscospark.com;secure');
      expect(response).toEqual('https://buy.ciscospark.com/store/ciscoctg/en_US/DisplayAccountOrderListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should get digital river subscriptions url', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, 'abc+123');
    this.DigitalRiverService.getSubscriptionsUrl().then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith('cookie', 'webexToken=abc+123;domain=ciscospark.com;secure');
      expect(response).toEqual('https://buy.ciscospark.com/store/ciscoctg/en_US/DisplaySelfServiceSubscriptionHistoryListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should logout', function () {
    this.$httpBackend.expectJSONP('https://buy.ciscospark.com/store/ciscoctg/en_US/remoteLogout?callback=JSON_CALLBACK').respond(200);
    this.DigitalRiverService.logout();
    this.$httpBackend.flush();
  });
});
