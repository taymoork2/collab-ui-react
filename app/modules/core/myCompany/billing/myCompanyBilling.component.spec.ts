describe('Component: myCompanyBilling', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      'DigitalRiverService',
      'Notification',
    );

    this.getDigitalRiverBillingUrlDefer = this.$q.defer();

    spyOn(this.DigitalRiverService, 'getBillingUrl').and.returnValue(this.getDigitalRiverBillingUrlDefer.promise);
    spyOn(this.DigitalRiverService, 'logout').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'errorWithTrackingId');

    this.compileComponent('myCompanyBilling');
  });

  describe('Digital River iframe', () => {
    it('should get digital river billing info url to load iframe', function () {
      this.getDigitalRiverBillingUrlDefer.resolve('https://some.url.com');
      this.$scope.$apply();

      expect(this.DigitalRiverService.getBillingUrl).toHaveBeenCalled();
      expect(this.controller.digitalRiverBillingUrl).toEqual('https://some.url.com');
    });

    it('should notify error if unable to get digital river url', function () {
      this.getDigitalRiverBillingUrlDefer.reject({
        data: undefined,
        status: 500,
      });
      this.$scope.$apply();

      expect(this.controller.loading).toBe(false);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(jasmine.any(Object), 'my-company.loadError');
    });
  });
});
