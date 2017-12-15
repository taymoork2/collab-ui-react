import digitalRiverModule from './index';

describe('Service: DigitalRiverService', () => {
  beforeEach(function () {
    this.initModules(digitalRiverModule);
    this.injectDependencies(
      '$document',
      '$httpBackend',
      '$sce',
      'Config',
      'DigitalRiverService',
      'UrlConfig',
    );

    this.cookie = 'cookie';
    this.subId = 'abc+123';
    this.webexToken = 'webexToken=abc+123;domain=ciscospark.com;secure';

    spyOn(this.$document, 'prop');
    this.$httpBackend.whenGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/abc+123').respond(200, this.subId);
    this.$httpBackend.whenGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, this.subId);
    spyOn(this.$sce, 'trustAsResourceUrl').and.returnValue('url/');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get digital river auth token', function () {
    this.DigitalRiverService.getDigitalRiverToken().then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith(this.cookie, this.webexToken);
      expect(response).toEqual(this.subId);
    });
    this.$httpBackend.flush();
  });

  it('should get digital river subscriptions url', function () {
    this.DigitalRiverService.getSubscriptionsUrl().then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith(this.cookie, this.webexToken);
      expect(response).toEqual('https://buy.webex.com/store/ciscoctg/en_US/DisplaySelfServiceSubscriptionHistoryListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should get digital river billing url', function () {
    this.DigitalRiverService.getBillingUrl().then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith(this.cookie, this.webexToken);
      expect(response).toEqual('https://buy.webex.com/DRHM/store?Action=DisplayAddEditPaymentPage&SiteID=ciscoctg&ThemeID=4805888100&DRL=abc%2B123');
    });
  });

  it('should get digital river order invoice url', function () {
    this.DigitalRiverService.getInvoiceUrl('123456', this.Config.onlineProducts.webex).then(response => {
      expect(this.$document.prop).toHaveBeenCalledWith(this.cookie, this.webexToken);
      expect(response).toEqual('https://buy.webex.com/store/ciscoctg/en_US/DisplayInvoicePage?requisitionID=123456&ThemeID=4777108300&DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });

  it('should retrieve upgrade trial url', function () {
    this.DigitalRiverService.getDigitalRiverUpgradeTrialUrl(this.subId).then((response: any) => {
      expect(response.data).toEqual(this.subId);
    });
    this.$httpBackend.flush();
  });

  it('should logout', function () {
    this.DigitalRiverService.logout('webex');
    expect(this.$sce.trustAsResourceUrl).toHaveBeenCalled();
  });
});
