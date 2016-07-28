describe('Service: MyCompanyOrdersService', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$httpBackend', '$scope', 'MyCompanyOrdersService', 'UrlConfig');
  });

  xit('should call email verify service', function () {
    this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/email').respond(200);
    this.MyCompanyOrdersService.supportsOrderHistory();
    this.$httpBackend.flush();
  });

  it('should get order details', function () {
    this.MyCompanyOrdersService.getOrderDetails().then((orderDetails) => {
      expect(orderDetails.length).toBe(0);
    });
    this.$scope.$apply();
  });
});
